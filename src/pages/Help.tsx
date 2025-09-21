import React, { useState } from 'react';
import { 
  Search, MessageCircle, Phone, Mail, ChevronDown, ChevronRight,
  HelpCircle, BookOpen, Shield, CreditCard, Home, User, Settings
} from 'lucide-react';
import Layout from '../components/Layout/Layout';

const Help: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'general', name: 'Umum', icon: HelpCircle },
    { id: 'search', name: 'Pencarian', icon: Search },
    { id: 'booking', name: 'Booking', icon: BookOpen },
    { id: 'payment', name: 'Pembayaran', icon: CreditCard },
    { id: 'account', name: 'Akun', icon: User },
    { id: 'safety', name: 'Keamanan', icon: Shield }
  ];

  const faqs = {
    general: [
      {
        question: 'Apa itu KosAtlas?',
        answer: 'KosAtlas adalah platform online yang memudahkan pencarian dan penyewaan kos di Semarang. Kami menghubungkan pencari hunian dengan pemilik kos yang terpercaya.'
      },
      {
        question: 'Bagaimana cara menggunakan KosAtlas?',
        answer: 'Cukup daftar akun, cari kos sesuai preferensi Anda, lihat detail properti, dan lakukan booking. Prosesnya mudah dan aman.'
      },
      {
        question: 'Apakah menggunakan KosAtlas gratis?',
        answer: 'Ya, menggunakan KosAtlas untuk mencari dan booking kos adalah gratis. Kami hanya mengambil komisi dari pemilik kos setelah transaksi berhasil.'
      },
      {
        question: 'Bagaimana cara menghubungi customer service?',
        answer: 'Anda dapat menghubungi kami melalui email support@kosatlas.com, telepon +62 812-3456-7890, atau live chat yang tersedia 24/7.'
      }
    ],
    search: [
      {
        question: 'Bagaimana cara mencari kos yang sesuai?',
        answer: 'Gunakan filter pencarian untuk memilih lokasi, jenis kos, rentang harga, dan fasilitas yang diinginkan. Anda juga dapat menggunakan kata kunci untuk pencarian yang lebih spesifik.'
      },
      {
        question: 'Apakah semua kos di KosAtlas sudah diverifikasi?',
        answer: 'Ya, semua kos yang terdaftar di KosAtlas telah melalui proses verifikasi untuk memastikan keaslian dan kualitas properti.'
      },
      {
        question: 'Bagaimana cara melihat lokasi kos di peta?',
        answer: 'Klik pada detail properti dan scroll ke bagian peta. Anda dapat melihat lokasi kos secara interaktif menggunakan Google Maps.'
      },
      {
        question: 'Apakah ada kos khusus putra/putri?',
        answer: 'Ya, kami memiliki filter khusus untuk kos putra, putri, dan campur. Anda dapat memilih sesuai preferensi Anda.'
      }
    ],
    booking: [
      {
        question: 'Bagaimana cara melakukan booking?',
        answer: 'Pilih kos yang diinginkan, klik "Booking Sekarang", isi data booking (tanggal mulai dan berakhir), tambahkan catatan jika perlu, lalu konfirmasi booking.'
      },
      {
        question: 'Apakah booking memerlukan pembayaran di muka?',
        answer: 'Tidak, booking tidak memerlukan pembayaran di muka. Pembayaran dilakukan setelah booking dikonfirmasi oleh pemilik kos.'
      },
      {
        question: 'Berapa lama waktu konfirmasi booking?',
        answer: 'Pemilik kos biasanya merespons dalam 24-48 jam. Jika tidak ada respons, tim kami akan membantu follow-up.'
      },
      {
        question: 'Bisakah membatalkan booking?',
        answer: 'Ya, Anda dapat membatalkan booking selama belum dikonfirmasi oleh pemilik kos. Setelah dikonfirmasi, pembatalan mengikuti kebijakan pemilik kos.'
      }
    ],
    payment: [
      {
        question: 'Metode pembayaran apa saja yang tersedia?',
        answer: 'Kami mendukung berbagai metode pembayaran: transfer bank, e-wallet (OVO, DANA, GoPay), kartu kredit/debit, dan pembayaran di tempat.'
      },
      {
        question: 'Apakah pembayaran aman?',
        answer: 'Ya, semua transaksi dilindungi enkripsi SSL dan kami bekerja sama dengan payment gateway terpercaya untuk keamanan maksimal.'
      },
      {
        question: 'Kapan pembayaran harus dilakukan?',
        answer: 'Pembayaran dilakukan setelah booking dikonfirmasi oleh pemilik kos, biasanya 1-3 hari sebelum tanggal mulai sewa.'
      },
      {
        question: 'Apakah ada biaya tambahan?',
        answer: 'Tidak ada biaya tersembunyi. Harga yang ditampilkan sudah termasuk semua biaya, kecuali biaya utilitas yang biasanya dibayar terpisah.'
      }
    ],
    account: [
      {
        question: 'Bagaimana cara mendaftar akun?',
        answer: 'Klik tombol "Daftar" di halaman utama, isi data pribadi, pilih peran (pencari kos atau pemilik kos), verifikasi email, dan akun Anda siap digunakan.'
      },
      {
        question: 'Bagaimana cara mengubah profil?',
        answer: 'Login ke akun Anda, klik menu profil, pilih "Edit Profil", ubah data yang diperlukan, dan simpan perubahan.'
      },
      {
        question: 'Lupa password, bagaimana cara reset?',
        answer: 'Klik "Lupa Password" di halaman login, masukkan email Anda, cek email untuk link reset password, dan ikuti instruksi yang diberikan.'
      },
      {
        question: 'Bagaimana cara menghapus akun?',
        answer: 'Hubungi customer service untuk proses penghapusan akun. Pastikan tidak ada transaksi aktif sebelum menghapus akun.'
      }
    ],
    safety: [
      {
        question: 'Apakah data pribadi saya aman?',
        answer: 'Ya, kami menggunakan enkripsi tingkat militer dan tidak membagikan data pribadi Anda kepada pihak ketiga tanpa izin.'
      },
      {
        question: 'Bagaimana cara melaporkan kos yang mencurigakan?',
        answer: 'Gunakan tombol "Laporkan" di halaman detail kos atau hubungi customer service. Tim kami akan segera menindaklanjuti laporan Anda.'
      },
      {
        question: 'Apakah ada jaminan keamanan transaksi?',
        answer: 'Ya, kami memberikan jaminan 100% uang kembali jika terjadi masalah dengan transaksi yang tidak sesuai dengan kesepakatan.'
      },
      {
        question: 'Bagaimana cara memverifikasi identitas pemilik kos?',
        answer: 'Semua pemilik kos telah melalui proses verifikasi identitas dan properti. Anda dapat melihat badge verifikasi di profil pemilik kos.'
      }
    ]
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pusat Bantuan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari bantuan..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories */}
          <div className="lg:col-span-1 animate-fade-in">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kategori
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {categories.find(c => c.id === activeCategory)?.name} - Pertanyaan Umum
              </h2>
              
              <div className="space-y-4">
                {faqs[activeCategory as keyof typeof faqs]?.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">
                        {faq.question}
                      </span>
                      {expandedFaq === index ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedFaq === index && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Masih Butuh Bantuan?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Tim support kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-blue-100 text-sm mb-4">
                Chat langsung dengan tim support
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Mulai Chat
              </button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Telepon</h3>
              <p className="text-blue-100 text-sm mb-4">
                +62 812-3456-7890
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Hubungi
              </button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-blue-100 text-sm mb-4">
                support@kosatlas.com
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Kirim Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
