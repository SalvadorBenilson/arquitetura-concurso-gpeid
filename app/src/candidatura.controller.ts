import { Request, Response } from 'express';
import amqp from 'amqplib';

export class CandidaturaController {
  private rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672';
  private queueName = 'fila_candidaturas';

  public submeter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, bi, especialidade } = req.body;
      const pdfFicheiro = req.file; // Middleware como 'multer' extrai o ficheiro aqui

      // 1. Validação básica imediata
      if (!nome || !bi || !pdfFicheiro) {
        res.status(400).json({ erro: 'Dados obrigatórios em falta ou PDF ausente.' });
        return;
      }

      // 2. Preparar os dados para a fila (convertendo o PDF em base64 ou guardando um path temporário)
      const mensagemCandidatura = {
        candidato: { nome, bi, especialidade },
        documento: {
          nomeOriginal: pdfFicheiro.originalname,
          bufferBase64: pdfFicheiro.buffer.toString('base64'),
          mimeType: pdfFicheiro.mimetype
        },
        dataSubmissao: new Date().toISOString()
      };

      // 3. Conectar ao RabbitMQ e enviar para a fila de processamento pesado
      const conexao = await amqp.connect(this.rabbitmqUrl);
      const canal = await conexao.createChannel();
      
      // Garante que a fila existe e é durável (não se perde se o RabbitMQ reiniciar)
      await canal.assertQueue(this.queueName, { durable: true });
      
      // Envia a mensagem persistente para a fila
      canal.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(mensagemCandidatura)),
        { persistent: true }
      );

      // Fecha as ligações à fila
      await canal.close();
      await conexao.close();

      // 4. Resposta Ultra Rápida ao Navegador (HTTP 202 - Aceite para Processamento)
      // O fluxo da resposta é fechado aqui à primeira tentativa. Fim do erro de stream!
      res.status(202).json({
        sucesso: true,
        mensagem: 'Candidatura recebida! O seu documento está a ser processado na fila de espera.',
        bi: bi
      });

    } catch (erro) {
      console.error('Erro no Controlador:', erro);
      
      // Tratamento de erro limpo sem quebrar a leitura do fluxo (Stream)
      res.status(500).json({
        erro: 'Ocorreu um erro interno no servidor ao registar na fila de espera.'
      });
    }
  };
}
