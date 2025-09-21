# KosAtlas

Platform terpercaya untuk mencari dan mengelola kos di Semarang. KosAtlas menghubungkan pencari hunian dengan pemilik kos yang terpercaya, menyediakan pengalaman pencarian yang mudah, aman, dan efisien.

## 🚀 Fitur Utama

### Untuk Pencari Kos
- **Pencarian Cerdas**: Filter berdasarkan lokasi, jenis kos, harga, dan fasilitas
- **Detail Lengkap**: Informasi komprehensif tentang properti, fasilitas, dan lokasi
- **Booking Mudah**: Proses booking yang cepat dan aman
- **Review & Rating**: Sistem review untuk membantu pengambilan keputusan
- **Peta Interaktif**: Integrasi Google Maps untuk melihat lokasi

### Untuk Pemilik Kos
- **Dashboard Manajemen**: Kelola properti dan pantau performa
- **Statistik Real-time**: Monitor pendapatan dan okupansi
- **Manajemen Booking**: Kelola booking dan konfirmasi penyewa
- **Verifikasi Properti**: Sistem verifikasi untuk meningkatkan kepercayaan

## 🛠️ Teknologi

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Context API

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/kosatlas.git
   cd kosatlas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   ```

4. **Build untuk production**
   ```bash
   npm run build
   ```

## 🎯 Struktur Proyek

```
src/
├── components/          # Komponen UI yang dapat digunakan kembali
│   ├── Layout/         # Komponen layout (Header, Footer, Layout)
│   ├── PropertyCard.tsx
│   └── SearchFilters.tsx
├── contexts/           # React Context untuk state management
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useProperties.ts
│   └── useBookings.ts
├── pages/              # Halaman aplikasi
│   ├── Auth/           # Halaman autentikasi
│   ├── Home.tsx
│   ├── Search.tsx
│   ├── PropertyDetail.tsx
│   ├── Bookings.tsx
│   ├── Dashboard.tsx
│   ├── About.tsx
│   └── Help.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx
```

## 🔧 Konfigurasi

### Environment Variables
Buat file `.env.local` di root project:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Tailwind CSS
Konfigurasi Tailwind sudah disetup di `tailwind.config.js` dengan custom colors dan spacing.

## 📱 Responsivitas

Aplikasi dirancang dengan mobile-first approach dan fully responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb)
- **Secondary**: Purple (#7c3aed)
- **Success**: Green (#059669)
- **Warning**: Yellow (#d97706)
- **Error**: Red (#dc2626)

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Sizes**: Responsive scale dari 12px hingga 48px

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository ke Vercel
3. Deploy otomatis

### Netlify
1. Build project: `npm run build`
2. Upload folder `dist` ke Netlify
3. Configure redirects untuk SPA

### Manual Server
1. Build project: `npm run build`
2. Upload folder `dist` ke web server
3. Configure server untuk SPA routing

## 📊 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🔒 Keamanan

- **Authentication**: JWT-based dengan refresh token
- **Data Validation**: Client-side dan server-side validation
- **HTTPS**: Enforced untuk semua komunikasi
- **XSS Protection**: Input sanitization dan CSP headers

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

- **Email**: info@kosatlas.com
- **Phone**: +62 812-3456-7890
- **Website**: https://kosatlas.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Vite](https://vitejs.dev/) - Build tool

---

Dibuat dengan ❤️ untuk memudahkan pencarian kos di Semarang
