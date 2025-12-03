const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  async receberWebhook(req, res) {
    try {
      const evento = req.body;

      console.log("📬 Webhook recebido do Asaas:", evento);

      if (!evento || !evento.event || !evento.payment) {
        return res.status(400).json({ error: "Webhook inválido." });
      }

      const { event, payment } = evento;

      // Busca o pedido pelo campo externalReference enviado no pagamento
      const referencia = payment.externalReference;
      if (!referencia || !referencia.startsWith("pedido_")) {
        return res.status(400).json({ error: "Referência externa inválida." });
      }

      const pedidoId = parseInt(referencia.replace("pedido_", ""));
      const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });

      if (!pedido) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }

      // Define novo status com base no evento recebido do Asaas
      let novoStatus = pedido.status;

      if (event === "PAYMENT_CONFIRMED") novoStatus = "PAGO";
      if (event === "PAYMENT_OVERDUE") novoStatus = "ATRASADO";
      if (event === "PAYMENT_CANCELED") novoStatus = "CANCELADO";

      // Atualiza status no banco
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: novoStatus },
      });

      console.log(`✅ Pedido ${pedidoId} atualizado para: ${novoStatus}`);
      return res.status(200).json({ message: "Webhook processado com sucesso." });

    } catch (error) {
      console.error("❌ Erro ao processar webhook:", error.message);
      return res.status(500).json({ error: "Erro ao processar webhook." });
    }
  }
};