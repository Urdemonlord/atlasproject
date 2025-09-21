import React from 'react';
import { 
  Users, Target, Award, Heart, Shield, Clock, 
  MapPin, Phone, Mail, MessageCircle 
} from 'lucide-react';
import Layout from '../components/Layout/Layout';

const About: React.FC = () => {
  const team = [
    {
      name: 'Ahmad Rizki',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Pengalaman 10 tahun di industri properti dan teknologi'
    },
    {
      name: 'Sarah Putri',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      description: 'Ahli teknologi dengan passion untuk inovasi'
    },
    {
      name: 'Budi Santoso',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Spesialis operasional dan customer experience'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Peduli',
      description: 'Kami peduli dengan kebutuhan dan kenyamanan setiap pengguna'
    },
    {
      icon: Shield,
      title: 'Terpercaya',
      description: 'Keamanan dan kepercayaan adalah prioritas utama kami'
    },
    {
      icon: Clock,
      title: 'Responsif',
      description: 'Kami selalu siap membantu dan merespons kebutuhan Anda'
    },
    {
      icon: Award,
      title: 'Kualitas',
      description: 'Kami berkomitmen memberikan layanan terbaik'
    }
  ];

  const stats = [
    { number: '1,200+', label: 'Pengguna Aktif' },
    { number: '500+', label: 'Kos Terdaftar' },
    { number: '4.8', label: 'Rating Rata-rata' },
    { number: '99%', label: 'Tingkat Kepuasan' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tentang KosAtlas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Platform terpercaya yang menghubungkan pencari kos dengan pemilik properti 
            di Semarang. Kami berkomitmen memberikan pengalaman terbaik dalam mencari hunian.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Misi Kami</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Menyediakan platform yang aman, mudah, dan terpercaya untuk memudahkan 
              pencarian kos di Semarang. Kami berkomitmen menghubungkan pencari hunian 
              dengan properti yang tepat sesuai kebutuhan dan budget mereka.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Visi Kami</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Menjadi platform nomor satu untuk pencarian kos di Indonesia, 
              dengan fokus pada kualitas layanan, keamanan transaksi, dan 
              kepuasan pengguna yang optimal.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Pencapaian Kami
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nilai-Nilai Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Tim Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Hubungi Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Alamat</h3>
              <p className="text-gray-600">
                Jl. Pemuda No. 123<br />
                Semarang Tengah<br />
                Jawa Tengah 50132
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telepon</h3>
              <p className="text-gray-600">
                +62 812-3456-7890<br />
                +62 24-1234-5678
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">
                info@kosatlas.com<br />
                support@kosatlas.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
