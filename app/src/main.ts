import express from 'express';
import multer from 'multer';
import { CandidaturaController } from './candidatura.controller';

const app = express();
const port = process.env.PORT || 3000;

// 1. Configuração do Multer para processar uploads em memória RAM
// Isto poupa o disco rígido da VPS e acelera o envio para o RabbitMQ
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB por PDF
});

// 2. Middlewares padrão para ler JSON e dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Inicialização do Controlador que desenhou
const candidaturaController = new CandidaturaController();

// 4. Definição da Rota de Inscrição
// 'documento' é o nome do campo (input do tipo file) que o Frontend vai enviar
app.post('/api/candidatura', upload.single('documento'), candidaturaController.submeter);

// Rota simples de Health Check para o Load Balancer monitorizar
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', instancia: process.env.CONTAINER_NAME || 'Node' });
});

// 5. Iniciar o servidor
app.listen(port, () => {
  console.log(`[App] Instância web a correr com sucesso na porta ${port}`);
});
