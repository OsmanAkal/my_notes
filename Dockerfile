# Base image
FROM node:18

# Çalışma dizini
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Uygulamayı başlat
CMD ["npm", "start"]
