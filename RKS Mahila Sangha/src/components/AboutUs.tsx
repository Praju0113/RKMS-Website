import { Target, Eye, Award, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AboutUs() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0A6C87] to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Raju Kshatriya Mahila Sangha</h1>
          <p className="text-xl max-w-3xl mx-auto text-cyan-50">
            A pioneering organization dedicated to women's empowerment and community development
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              Raju Kshatriya Mahila Sangha is a dynamic women's organization committed to creating positive change 
              in our community. Founded on the principles of empowerment, equality, and cultural preservation, 
              we have been serving our community for over 15 years.
            </p>
            <p className="text-gray-700 mb-4">
              We bring together women from diverse backgrounds to create a supportive network that fosters 
              personal growth, skill development, and community engagement. Through our various programs 
              and initiatives, we strive to make a meaningful impact in the lives of women and their families.
            </p>
            <p className="text-gray-700">
              Our organization is built on the foundation of traditional values while embracing modern 
              approaches to women's empowerment and social development.
            </p>
          </div>
          <div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1764751024389-857d08396423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMHdvbWVuJTIwbGF1Z2hpbmclMjBkaXNjdXNzaW5nJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzAxMTE5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Women community gathering"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Mission, Vision, Objectives */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700">
                To empower women through education, skill development, and community support, 
                enabling them to become confident, independent, and contributing members of society 
                while preserving our cultural heritage.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#E5C10033] rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-[#E5C100]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700">
                A society where every woman is empowered, respected, and has equal opportunities 
                to achieve her dreams while maintaining strong cultural roots and community bonds 
                that strengthen our collective identity.
              </p>
            </div>

            {/* Objectives */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-[#0A6C87]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Objectives</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Promote women's education and skill development</li>
                <li>• Foster cultural preservation and awareness</li>
                <li>• Build supportive community networks</li>
                <li>• Organize social and cultural events</li>
                <li>• Support women in need</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Event Photography Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Events & Moments</h2>
          <p className="text-xl text-gray-600">
            Capturing memorable moments from our community gatherings and celebrations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
            'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
            'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600',
            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
          ].map((img, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg shadow-lg group">
              <ImageWithFallback
                src={img}
                alt={`Event photo ${index + 1}`}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Leadership/Team Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Users className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are guided by principles of integrity, compassion, and community service
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Empowerment', description: 'Enabling women to reach their full potential' },
              { title: 'Unity', description: 'Building strong community bonds' },
              { title: 'Tradition', description: 'Preserving our cultural heritage' },
              { title: 'Progress', description: 'Embracing positive change' },
            ].map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}