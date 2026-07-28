### 1. Rodar o comando para subir a instancia
docker compose up -d --build

### 2. Testar a API de candidatura
curl -X POST http://localhost/api/candidatura \
  -F "nome=Januário Silva" \
  -F "bi=001234567LA049" \
  -F "especialidade=Matemática" \
  -F "documento=@/downloads/BS - CV.pdf"

