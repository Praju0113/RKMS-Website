import { Target, Eye, Award, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import smtIndira from '../assets/Smt. Indira.png';
import shanthaKondur from '../assets/Shantha Kondur.png';
import babhithaNadampalli from '../assets/Babitha Nadampalli Sreedhara Raju.png';
import padmar from '../assets/Ms. Padma R.png';
import padmaraju from '../assets/Smt. Padma Raju.png';
import leelakrishnamaraju from '../assets/Mrs. Leelakrishnamaraju.png';
import pushpavasu from '../assets/Pushpa Vasu.png';


export function AboutUs() {
  const [activeTab, setActiveTab] = useState("current");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Organization History</h2>
            <p className="text-gray-700 mb-4 text-justify">
              In the year 2022, the RKS Mahila Vedike marked its inception by ceremonially lighting its first 
              auspicious Deepam, symbolizing hope, unity, and collective strength. What began as a modest initiative 
              has since grown into a vibrant and dynamic platform. As of today, the Mahila Vedike has expanded to a 
              strong membership of approximately 752 women, reflecting an impressive growth of nearly 300% since its 
              inception. This growth signifies not merely numerical expansion, but a meaningful transformation in 
              community engagement and empowerment.
            </p>
            <p className="text-gray-700 mb-4 text-justify">
              The Mahila Vedike was established in 2022 under the aegis of the Raju Kshatriya Sangha (R), Jayanagar, 
              Bengaluru, Karnataka. With the guidance and leadership of the Hon’ble President, Sri Ganesh Raju, along 
              with the esteemed Committee Members of the Sangha, the women’s wing was formally constituted. The inaugural 
              function was held on 8th October 2022 at Chamaraju Kalyana Mandira, Jayanagar, Bengaluru, marking the official 
              commencement of the RKS Mahila Vedike.
            </p>
            <p className="text-gray-700 mb-4 text-justify">
              In its initial phase, the committee members of the RKS Mahila Sangha actively conducted door-to-door outreach 
              initiatives across select areas in and around Jayanagar to enrol women into the Mahila Vedike, with a nominal 
              lifetime membership fee of ₹500. Over time, these efforts yielded substantial growth, and by 2024, the membership 
              base had expanded to approximately 500 members, with registrations being facilitated through both online and offline channels.
            </p>
            <p className="text-gray-700 text-justify">
              As our activities grew multifold, there was a need to register the Sangha into a formal entity, and therefore, the Sangha was 
              registered before the  Registrar of societies, Bangalore, on the 13th of December 2024 and was named ‘Raju Kshatriya Mahila Sangha’ 
              (RKMS) bearing registration number DRB1/SOR/343/2024-2025. 
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

      {/* committee Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Committee
            </h2>
            <p className="text-xl text-gray-600">
              Our dedicated committees working towards community empowerment
            </p>
          </div>
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'current'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Current Members
            </button>
            <button
              onClick={() => setActiveTab('former')}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'former'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Former Members
            </button>
          </div>

          {/* Current Members */}
          {activeTab === 'current' && (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Smt. Indira',
                  title: 'Founding Member & President',
                  photo: smtIndira,
                  bio: 'Smt. Indira Raju is the daughter of Late Sri V. Ramaraju, (former Secretary of R.K.S., Bangalore). Smt Indira is the Founding Member and President of the Sangha. With a vision to bring women of the community to the forefront, she is dedicated to their upliftment and empowerment. Having served as a Secretary in a Credit Co-operative Society, she possesses valuable experience in office administration and accounts. She actively encourages collective participation to achieve the objectives of the Sangha.'
                },
                {
                  name: 'Shantha Kondur, BSc, MBA (HR) ',
                  title: 'Founding Member and Vice President ',
                  photo: shanthaKondur,
                  bio: 'A retired Deputy Controller of Accounts Officer at KPTCL (erstwhile KEB), Mrs. Shantha Kondur brings 34 years of experience in Revenue, Auditing, Finance & Accounts, and Service Regulations. Recognized for her dedication, she held key positions throughout her career and made history as the first woman officer to serve at the Corporate Office as Assistant General Manager -AGM (Services). Having retired 6 years ago, she still continues to be consulted on pay fixation matters across the State of Karnataka and has contributed to recruitment, pay revisions, labour issues, and policy updates. She is passionate about travel and reading, and strongly believes in kindness and helping those in need. She is the Vice President and a founding member of the Raju Kshatriya Mahila Sangha. As the First woman professional from her paternal side , she has broken glass ceilings. She is grateful for the support of her husband who served as the Secretary of the Raju Kshatriya Sangha, her 2 daughters and the love received from her grandchildren. She remains content with her fulfilling career and life.'
                },
                {
                  name: 'Babitha Nadampalli Sreedhara Raju ',
                  title: 'Founding Member and General Secretary ',
                  photo: babhithaNadampalli,
                  bio: 'She is a first-generation lawyer. After completion of her Master’s degree in Law, she is currently teaching law and has been writing articles extensively in national and international Journals. Throughout her journey, she has been guided by the unwavering support of her parents and husband, which has enabled her to pursue her work with integrity and dedication. She is ever grateful for the opportunity to be part of this meaningful and inspiring journey with Raju Kshatriya Mahila Sangha.'
                },
                {
                  name: 'Ms. Padma R ',
                  title: 'Joint Secretary ',
                  photo: padmar,
                  bio: 'Ms. Padma R is a Postgraduate Engineer specializing in VLSI System Design, with nearly two decades of experience in the semiconductor industry. She was a key Core Member of the almost 4K Embedded Systems Design team at Tata Consultancy Services (TCS), where she also led the Physical Design team and successfully managed multiple projects. She played a significant role in building and strengthening teams by effectively handling diverse roles and responsibilities. Prior to her tenure at TCS, she worked with U & I Scotty Design Center, Nikkel Exports Corporation, Digipro Design Services, and Process Electronics. Currently, she is engaged in her family business and actively participates in philanthropic initiatives focused on community welfare. In her retired life, she is dedicated to giving back to society unconditionally, reflecting her deep sense of social responsibility.'
                },
                {
                  name: 'Smt. Padma Raju ',
                  title: 'Founding Member and Treasurer',
                  photo: padmaraju,
                  bio: 'Smt. Padma Raju is an Arts graduate with diverse professional experience and has retired from  HSBC. Driven by a compassion for people’s causes, she introspected her strengths and chose to further her impact by becoming a certified counselor. Through this, she strives to support individuals, promote well-being, and contribute meaningfully to society. As Treasurer, Smt. Padma Raju brings dedication, empathy, and a strong sense of responsibility.'
                },
                {
                  name: 'Mrs. Leelakrishnamaraju ',
                  title: 'Founding Member and Cultural Secretary ',
                  photo: leelakrishnamaraju,
                  bio: 'Mrs. Leelakrishnamaraju has over 28 years of experience as an Art and Craft teacher and Event Manager, having served in reputed educational institutions. She possesses a keen interest in engaging people through fun and interactive activities, fostering creativity and community participation. She is currently serving as the Cultural Secretary at Raju Kshatriya Mahila Sangha, where she contributes to organizing and promoting cultural initiatives with dedication and enthusiasm.'
                },
                {
                  name: 'Pushpa Vasu',
                  title: 'Committee Member serving as the Coordinator ',
                  photo: pushpavasu,
                  bio: 'Pushpa Vasu is a Committee Member serving as the Coordinator for Malleshwaram since 2022 and has actively participated in all events as a coordinator, by motivating people to come forward for a good cause.She actively participates in temple activities across Malleshwaram and her deep commitment to community service and cultural traditions.She takes pride in being a homemaker.She is guided by a strong spirit of compassion and service, with a dedicated focus on the welfare and empowerment of women. Known for her warm and approachable nature, she has a natural ability to bring people together.'
                }
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-cyan-600 overflow-hidden">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-cyan-600 font-semibold mb-4">{member.title}</p>
                    <p className="text-gray-700 text-sm leading-relaxed text-justify">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Former Members */}
          {activeTab === 'former' && (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Former Member Name',
                  title: 'Former President',
                  photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
                  bio: 'Brief biography and role description for the former member. Add their background, experience, and contributions during their tenure with the organization.',
                  tenure: '2018-2021'
                },
                {
                  name: 'Former Member Name',
                  title: 'Former Secretary',
                  photo: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop',
                  bio: 'Brief biography and role description for the former member. Add their background, experience, and contributions during their tenure with the organization.',
                  tenure: '2019-2022'
                },
                {
                  name: 'Former Member Name',
                  title: 'Former Treasurer',
                  photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
                  bio: 'Brief biography and role description for the former member. Add their background, experience, and contributions during their tenure with the organization.',
                  tenure: '2017-2020'
                }
              ].map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-gray-400 overflow-hidden">
                  <div className="aspect-square w-full overflow-hidden bg-gray-200">
                    <ImageWithFallback
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-gray-600 font-semibold mb-1">{member.title}</p>
                    <p className="text-sm text-gray-500 mb-4">Tenure: {member.tenure}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our organization
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: "How can I become a member of Raju Kshatriya Mahila Sangha?",
              answer: "You can become a member by visiting our Membership page and completing the registration form. The membership fee is ₹1,001, and you'll receive a unique membership ID after successful payment. Membership is open to all women from the Raju Kshatriya community."
            },
            {
              question: "What programs and services does the organization offer?",
              answer: "We offer a wide range of programs including skill development workshops, cultural events, educational seminars, health awareness camps, counseling services, and community welfare programs. Our committees organize various activities throughout the year to support women's empowerment and community development."
            },
            {
              question: "How are committee members selected?",
              answer: "Committee members are elected through a democratic process during our annual general meeting. Members can nominate themselves or be nominated by other members. Elections are conducted transparently, and committee members serve a tenure of 3 years."
            },
            {
              question: "Can I volunteer without being a member?",
              answer: "While we encourage membership for regular participation, we welcome volunteers for specific events and programs. You can contact us through our website or attend our events to learn more about volunteer opportunities. However, certain benefits and voting rights are reserved for registered members."
            },
            {
              question: "How are donations utilized by the organization?",
              answer: "All donations are used transparently for our community welfare programs, educational initiatives, event organization, and supporting women in need. We maintain detailed financial records and provide regular updates to our members about fund utilization. Donations are tax-deductible under applicable laws."
            },
            {
              question: "How often does the organization conduct events?",
              answer: "We organize events throughout the year, including monthly meetings, quarterly cultural programs, annual celebrations, and special workshops. Members receive regular updates about upcoming events through email, SMS, and our social media channels."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-2xl text-cyan-600">
                  {openFaq === index ? '−' : '+'}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Event Photography Section 
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

      {/* Leadership/Team Section 
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
      */}
    </div>
  );
}