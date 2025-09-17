import { Heading, Text } from '@radix-ui/themes'
import {
  Award,
  Brain,
  Building,
  ChevronRight,
  Download,
  Gift,
  Globe,
  GraduationCap,
  Heart,
  Lock,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '../components/landing-page/Header'
import { cn } from '../utils/helperFunctions'

const Home = () => {

  const Card = ({
    children,
    className = '',
    hover = true,
    glowing = false
  }) => (
    <div className={cn(
      'relative bg-[--color-background] rounded-xl p-6 shadow-sm overflow-hidden',
      hover && 'hover:shadow-xl  transition-all duration-500 hover:-translate-y-2 hover:scale-105',
      glowing && 'before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-r before:from-[--blue-9] before:via-[--purple-9] before:to-[--pink-9] before:animate-pulse',
      className
    )}>
      {glowing && (
        <div className="absolute inset-[1px] rounded-xl bg-[--color-panel] z-10"></div>
      )}
      <div className="relative z-20">{children}</div>
    </div>
  )

  const AnimatedBackground = () => (
    <div className="overflow-hidden fixed inset-0 pointer-events-none">
      <div className="absolute -inset-10 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-[--blue-a8] to-[--purple-a8] rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  )

  const FloatingElement = ({ children, delay = 0 }) => (
    <div
      className="animate-bounce"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      {children}
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-[--brand-blue-light] via-[--color-background] to-[--brand-purple-light]">

      {/* Hero Section */}
      <section className="overflow-hidden relative py-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-12 items-center lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-[--accent-a11] bg-gradient-to-r to-[--purple-a3] rounded-full animate-pulse from-[--blue-a3]">
                  <Sparkles className="w-4 h-4" color='var(--accent-a11)' />
                  <span>Revolutionary Education Rewards Platform</span>
                  <Sparkles className="w-4 h-4"  color='var(--accent-a11)'/>
                </div>
                <Text as='p' className="text-5xl font-bold leading-tight md:text-7xl">
                  Transform
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[--blue-11] via-[--purple-11] to-[--pink-11]">
                    Education Through
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r to-[--blue-9] from-[--green-9]">
                    Gamified Rewards
                  </span>
                </Text>
                <Text color='gray' as='p' className='max-w-2xl text-xl leading-relaxed md:text-2xl'>
                  Experience the future of education with our revolutionary platform that turns learning into an adventure.
                  Students earn digital rewards, parents stay engaged, and schools track progress with unprecedented insight.
                  <Text as='span' className='block mt-3 text-lg font-medium' color='blue'>
                    🎯 Boost attendance by 40% • 📈 Increase engagement by 60% • 🏆 Reward achievements instantly
                  </Text>
                </Text>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[--blue-11] to-[--purple-11] rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                  <Button size="lg" className="relative transition duration-200 transform hover:scale-105">
                    <Download className="mr-2 w-5 h-5 animate-bounce" />
                    Download App Now
                    <Sparkles className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" size="lg" className="border-2 transition duration-200 transform hover:scale-105 group">
                  <Zap className="mr-2 w-5 h-5" />
                  See Demo
                  <ChevronRight className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* <FloatingElement> */}
              <div className="relative z-10 group">
                <img
                  src="images/iPhone-15-Pro-Black-Titanium-Mockup-Portrait.svg"
                  alt="RFE Mobile App"
                  className="mx-auto w-full max-w-md transition duration-500 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r rounded-3xl opacity-60 blur-2xl animate-pulse from-[--blue-a3]  to-[--purple-a3]"></div>
              </div>
              {/* </FloatingElement> */}
              <div className="absolute -inset-8 bg-gradient-to-r rounded-full blur-3xl animate-spin from-[--blue-a3] via-[--purple-a3] to-[--pink-a6]" style={{ animationDuration: '20s' }}></div>
            </div>
          </div>
        </div>
      </section>
      <AnimatedBackground />

      {/* Features Section */}
      <section className="overflow-hidden relative py-20 bg-gradient-to-br from-[--color-background] to-[--gray-background]">
        <div className="absolute inset-0 opacity-5 bg-grid-pattern"></div>
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="inline-flex items-center px-6 py-3 mb-6 space-x-2 text-sm font-medium text-[--accent-a11] bg-gradient-to-r to-[--purple-a3] from-[--blue-a3] rounded-full animate-bounce">
              <Brain className="w-5 h-5" />
              <span>AI-Powered Educational Ecosystem</span>
              <Target className="w-5 h-5" />
            </div>
            <Text as='p' className="mb-6 text-4xl font-bold md:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--blue-11] to-[--purple-11]">
                Revolutionary
              </span>
              <br />
              Learning Experience
            </Text>

            <Text as='p' color='gray' className="mx-auto max-w-4xl text-xl leading-relaxed md:text-2xl">
              Step into the future of education where every action counts, every achievement matters,
              and every student thrives through intelligent reward mechanisms and real-time analytics.
            </Text>

            <div className="flex justify-center mt-8 space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <Text as='span' color='gray' >10M+ Students</Text>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <Text as='span' color='gray' >50+ Countries</Text>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <Text as='span' color='gray' >1M+ Rewards Earned</Text>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <Card glowing hover className="group">
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-r to-[--blue-9] rounded-2xl shadow-lg transition-all duration-300 from-[--blue-8] group-hover:shadow-[--blue-a6]">
                    <GraduationCap className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 bg-yellow-400 rounded-full">
                    <Star className="w-3 h-3 text-yellow-800" />
                  </div>
                </div>
                <div>
                  <Heading as='h3' className="mb-2 text-xl font-bold">
                    Smart Students
                  </Heading>
                  <Text as='p' className="mb-3 text-sm font-medium" color='blue'>Ages 5-18 • K-12 Education</Text>
                  <Text as='p' className="leading-relaxed" color='gray'>
                    Transform your educational journey with gamified learning. Earn cryptocurrency rewards, unlock achievements, and compete with friends while mastering subjects.
                  </Text>

                  <div className="mt-4 space-y-2">
                    <Text as='div' color='green' className="flex items-center text-sm">
                      <Zap className="mr-2 w-4 h-4" />
                      <span>Instant reward notifications</span>
                    </Text>

                    <Text as='div' color='violet' className="flex items-center text-sm">
                      <Brain className="mr-2 w-4 h-4" />
                      <span>AI-powered study recommendations</span>
                    </Text>

                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full transition-all duration-300 group-hover:bg-[--blue-9] group-hover:text-white group-hover:border-[--blue-9]">
                  Start Learning
                  <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>

            <Card glowing hover className="group">
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-r from-[--green-8] to-[--jade-9] rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-[--green-a6]">
                    <Heart className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 bg-pink-400 rounded-full">
                    <Users className="w-3 h-3 text-pink-800" />
                  </div>
                </div>
                <div>
                  <Heading as='h3' className="mb-2 text-xl font-bold">Caring Guardians</Heading>
                  <Text as='p' className="mb-3 text-sm font-medium" color='green'>Parents • Social Workers • Families</Text>
                  <Text as='p' className="leading-relaxed" color='gray'>
                    Stay connected to your child's educational adventure with real-time insights,
                    milestone celebrations, and collaborative goal-setting tools.
                  </Text>

                  <div className="mt-4 space-y-2">
                    <Text as='div' color='green' className="flex items-center text-sm">
                      <TrendingUp className="mr-2 w-4 h-4" />
                      <span>Real-time progress tracking</span>
                    </Text>

                    <Text as='div' color='violet' className="flex items-center text-sm">
                      <Gift className="mr-2 w-4 h-4" />
                      <span>Family reward challenges</span>
                    </Text>

                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full transition-all duration-300 group-hover:bg-[--green-9] group-hover:text-white group-hover:border-[--green-9]">
                  Join Community
                  <Heart className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />
                </Button>
              </div>
            </Card>

            <Card glowing hover className="group">
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-r from-[--purple-8] to-[--violet-9] rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-[--purple-a6]">
                    <Building className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 bg-blue-400 rounded-full">
                    <Target className="w-3 h-3 text-blue-800" />
                  </div>
                </div>
                <div>
                  <Heading as='h3' className="mb-2 text-xl font-bold">Elite Institutions</Heading>
                  <Text as='p' className="mb-3 text-sm font-medium" color='purple'>Schools • Universities • Organizations</Text>
                  <Text as='p' className="leading-relaxed" color='gray'>
                    Transform your institution with cutting-edge analytics, automated reward systems,
                    and comprehensive student engagement monitoring.
                  </Text>
                  <div className="mt-4 space-y-2">
                    <Text as='div' color='green' className="flex items-center text-sm">
                      <Brain className="mr-2 w-4 h-4" />
                      <span>AI-powered analytics dashboard</span>
                    </Text>

                    <Text as='div' color='violet' className="flex items-center text-sm">
                      <Gift className="mr-2 w-4 h-4" />
                      <span>Custom reward programs</span>
                    </Text>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full transition-all duration-300 group-hover:bg-[--purple-9] group-hover:text-white group-hover:border-[--purple-9]">
                  Get Enterprise
                  <Building className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />
                </Button>
              </div>
            </Card>

            <Card glowing hover className="group">
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-r from-[--orange-8] to-[--red-9] rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-[--orange-a6]">
                    <Star className="w-8 h-8 text-white transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                  <div className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 bg-green-400 rounded-full">
                    <TrendingUp className="w-3 h-3 text-green-800" />
                  </div>
                </div>
                <div>
                  <Heading as='h3' className="mb-2 text-xl font-bold">Visionary Partners</Heading>
                  <Text as='p' className="mb-3 text-sm font-medium" color='orange'>Businesses • Sponsors • Foundations</Text>
                  <Text as='p' className="leading-relaxed" color='gray'>
                    Invest in the future of education while building brand loyalty. Sponsor student achievements and track your social impact with detailed community analytics.
                  </Text>
                  <div className="mt-4 space-y-2">
                    <Text as='div' color='green' className="flex items-center text-sm">
                      <Globe className="mr-2 w-4 h-4" />
                      <span>Global impact measurement</span>
                    </Text>

                    <Text as='div' color='violet' className="flex items-center text-sm">
                      <Sparkles className="mr-2 w-4 h-4" />
                      <span>Brand visibility rewards</span>
                    </Text>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full transition-all duration-300 group-hover:bg-[--orange-9] group-hover:text-white group-hover:border-[--orange-9]">
                  Become Sponsor
                  <Star className="ml-2 w-4 h-4 transition-transform group-hover:rotate-12" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="overflow-hidden relative py-20 bg-gradient-to-br from-[--brand-blue-light] via-[--brand-purple-light] to-[--brand-pink-light]">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl bg-blue-300/20 animate-float"></div>
          <div className="absolute right-20 bottom-20 w-40 h-40 rounded-full blur-3xl bg-purple-300/20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full blur-2xl bg-pink-300/20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--blue-11] to-[--purple-11] animate-gradient-x">
                Experience the Magic
              </span>
              <br />
              of Gamified Education
            </h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-3">
            <Card glowing hover className="overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br transition-all duration-500 from-[--blue-a2] to-[--purple-a2] group-hover:from-[--blue-a3] group-hover:to-[--purple-a3]"></div>
              <div className="relative z-10 space-y-6 text-center">
                <div className="flex justify-center items-center mx-auto w-20 h-20 bg-gradient-to-r from-[--blue-a9] to-[--purple-a9] rounded-3xl shadow-2xl transition-all duration-500 group-hover:shadow-[--blue-a6]">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <div>
                  <Heading as='h3' className="mb-3 text-2xl font-bold">Smart Rewards System</Heading>
                  <div className="inline-flex items-center px-3 py-1 mb-4 space-x-2 text-xs font-medium text-[--blue-a11] bg-gradient-to-r from-[--blue-a3] to-[--purple-a3] rounded-full">
                    <Zap className="w-3 h-3" />
                    <span>Blockchain-Powered</span>
                  </div>
                  <Text as='p' className="leading-relaxed" color='gray'>
                    Revolutionary cryptocurrency-based reward system where students earn TUIT tokens for educational achievements.
                    Redeem for scholarships, premium study materials, tech gadgets, and exclusive educational experiences.
                  </Text>
                  <div className="mt-6 space-y-2">
                    <Text as='div' color='green' className="flex justify-center items-center text-sm">
                      <Zap className="mr-2 w-4 h-4" />
                      <span>Instant token rewards</span>
                    </Text>

                    <Text as='div' color='violet' className="flex justify-center items-center text-sm">
                      <div className="mr-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <span>Global marketplace access</span>
                    </Text>
                  </div>
                </div>
                <img src="/images/trophy.png" alt="Trophy" className="mx-auto w-28 h-28 opacity-90" />
              </div>
            </Card>

            <Card glowing hover className="overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br transition-all duration-500 from-[--green-a2] to-[--teal-a2] group-hover:from-[--green-a3] group-hover:to-[--teal-a3]"></div>
              <div className="relative z-10 space-y-6 text-center">
                <div className="flex justify-center items-center mx-auto w-20 h-20 bg-gradient-to-r from-[--green-a9] to-[--teal-a9] rounded-3xl shadow-2xl transition-all duration-500 group-hover:shadow-[--green-a6]">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div>
                  <Heading as='h3' className="mb-3 text-2xl font-bold">Family Connection Hub</Heading>
                  <div className="inline-flex items-center px-3 py-1 mb-4 space-x-2 text-xs font-medium text-[--green-a11] bg-gradient-to-r from-[--green-a3] to-[--teal-a3] rounded-full">
                    <Heart className="w-3 h-3" />
                    <span>AI-Enhanced Insights</span>
                  </div>
                  <Text as='p' className="leading-relaxed" color='gray'>
                    Advanced parental dashboard with real-time notifications, predictive analytics for academic performance, and collaborative goal-setting tools that strengthen family bonds through education.
                  </Text>
                  <div className="mt-6 space-y-2">
                    <Text as='div' color='green' className="flex justify-center items-center text-sm">
                      <Heart className="mr-2 w-4 h-4" />
                      <span>Live progress updates</span>
                    </Text>

                    <Text as='div' color='violet' className="flex justify-center items-center text-sm">
                      <div className="mr-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <span>Family achievement badges</span>
                    </Text>

                  </div>
                </div>
                <img src="/images/family-insurance.png" alt="Family" className="mx-auto w-28 h-28 opacity-90" />
              </div>
            </Card>

            <Card glowing hover className="overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br transition-all duration-500 from-[--purple-a2] to-[--pink-a2] group-hover:from-[--purple-a3] group-hover:to-[--pink-a3]"></div>
              <div className="relative z-10 space-y-6 text-center">
                <div className="flex justify-center items-center mx-auto w-20 h-20 bg-gradient-to-r from-[--purple-a9] to-[--pink-a9] rounded-3xl shadow-2xl transition-all duration-500 group-hover:shadow-[--purple-a6]">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div>
                  <Heading as='h3' className="mb-3 text-2xl font-bold">AI-Powered Analytics</Heading>
                  <div className="inline-flex items-center px-3 py-1 mb-4 space-x-2 text-xs font-medium text-[--purple-a11] bg-gradient-to-r from-[--purple-a3] to-[--pink-a3] rounded-full">
                    <Brain className="w-3 h-3" />
                    <span>Machine Learning</span>
                  </div>
                  <Text as='p' className="leading-relaxed" color='gray'>
                    Comprehensive administrative suite with predictive analytics, automated report generation,
                    behavioral pattern recognition, and seamless integration with existing school information systems.
                  </Text>

                  <div className="mt-6 space-y-2">
                    <Text as='div' color='green' className="flex justify-center items-center text-sm">
                      <div className="mr-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Predictive analytics dashboard</span>
                    </Text>

                    <Text as='div' color='violet' className="flex justify-center items-center text-sm">
                      <div className="mr-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <span>Automated intervention alerts</span>
                    </Text>
                  </div>
                </div>
                <img src="/images/time-planning-1.png" alt="Planning" className="mx-auto w-28 h-28 opacity-90" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Features */}
      <section className="overflow-hidden relative py-20 bg-gradient-to-br from-[--color-background] to-[--brand-blue-light]">
        <div className="absolute inset-0 opacity-30 bg-grid-pattern"></div>
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="inline-flex items-center px-6 py-3 mb-6 space-x-2 text-sm font-medium text-[--orange-a11] bg-gradient-to-r from-[--yellow-a3] to-[--orange-a3] rounded-full animate-bounce">
              <Gift className="w-5 h-5" />
              <span>Global Reward Marketplace</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="mb-6 text-4xl font-bold md:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--orange-11] via-[--red-11] to-[--pink-11] animate-gradient-x">
                Unlimited Rewards
              </span>
              <br />
              Endless Possibilities
            </h2>
            <Text as='p' className="mx-auto max-w-4xl text-xl leading-relaxed md:text-2xl" color='gray'>
              Access an ever-expanding universe of rewards, from cutting-edge technology to exclusive experiences.
              Our platform connects students with a global network of partners offering life-changing opportunities.
            </Text>
          </div>

          <div className="grid gap-16 items-center mb-20 md:grid-cols-2">
            <div className="space-y-8">
              <Card glowing hover className="group">
                <div className="flex items-start space-x-6">
                  <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 bg-gradient-to-r from-[--blue-a9] to-[--cyan-a9] rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-[--blue-a6]">
                    <Lock className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <Heading as='h3' className="mb-3 text-2xl font-bold transition-colors group-hover:text-[--blue-a11]">Next-Gen Security</Heading>
                    <Text as='p' className="mb-3 text-sm font-medium" color='blue'>Blockchain • Zero-Knowledge Proofs • Military-Grade Encryption</Text>
                    <Text as='p' className="leading-relaxed" color='gray'>
                      Revolutionary blockchain-based document storage with quantum-resistant security.
                      Students maintain complete ownership of their academic records with instant global verification via QR codes.
                    </Text>
                    <div className="flex items-center mt-4 space-x-4 text-sm">
                      <Text as='div' color='green' className="flex items-center text-sm">
                        <div className="mr-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>99.99% Uptime</span>
                      </Text>

                      <Text as='div' color='blue' className="flex items-center text-sm">
                        <div className="mr-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <span>Global Verification</span>
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>

              <Card glowing hover className="group">
                <div className="flex items-start space-x-6">
                  <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 bg-gradient-to-r from-[--purple-a9] to-[--pink-a9] rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-[--purple-a6]">
                    <Heart className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <Heading as='h3' className="mb-3 text-2xl font-bold transition-colors group-hover:text-[--purple-a11]">Social Impact Network</Heading>
                    <Text as='p' className="mb-3 text-sm font-medium" color='purple'>Global Partnerships • Micro-Scholarships • Community Building</Text>
                    <Text as='p' className="leading-relaxed" color='gray'>
                      Creating pathways for underprivileged children through our global network of sponsors, businesses, and educational institutions.
                      Every reward earned contributes to a larger ecosystem of positive change.
                    </Text>
                    <div className="flex items-center mt-4 space-x-4 text-sm">
                      <Text as='div' color='green' className="flex items-center text-sm">
                        <div className="mr-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>$2M+ Distributed</span>
                      </Text>

                      <Text as='div' color='purple' className="flex items-center text-sm">
                        <div className="mr-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <span>500+ Partners</span>
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="relative">
              <div className="relative group">
                <img src="/images/blockchain-1.png" alt="Blockchain Technology" className="mx-auto w-full max-w-lg transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-[--blue-a3] rounded-3xl opacity-60 blur-2xl animate-pulse via-[--purple-a3] to-[--pink-a3]"></div>
              </div>
              <FloatingElement delay={1}>
                <img src="/images/technology.png" alt="Technology" className="absolute -right-12 -bottom-12 w-40 h-40 opacity-80 animate-float" />
              </FloatingElement>
              <div className="absolute -left-8 top-1/4 w-6 h-6 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute -right-4 bottom-1/3 w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg">
              <Smartphone className="mr-2 w-5 h-5" />
              Download App - iOS & Android
            </Button>
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-20 bg-[--gray-background]">
        <div className="px-4 mx-auto max-w-4xl text-center sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex justify-center items-center mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">Data Protection</h2>
            <Text as='p' className="text-xl leading-relaxed" color='gray'>
              The only student data we hold is provided by the schools, such as attendance records and task participation.
              The app does not include any communication or social functionalities for children, except where parents and teachers interact responsibly.
            </Text>
            <Button variant="outline">
              Read More
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="overflow-hidden relative py-20 text-white bg-gradient-to-br from-[--blue-9] via-[--purple-9] to-[--pink-9]">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full blur-2xl bg-white/10 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full blur-3xl bg-white/5 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative px-4 mx-auto max-w-5xl text-center sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-6 py-3 space-x-2 text-sm font-medium text-white rounded-full backdrop-blur-sm animate-pulse bg-white/20">
                <Sparkles className="w-5 h-5" />
                <span>Ready to Transform Education?</span>
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-4xl font-bold leading-tight md:text-6xl">
                <span className="block">Let's Build the Future</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[--yellow-9] to-[--amber-9] animate-gradient-x">
                  of Learning Together
                </span>
              </h2>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed opacity-90 md:text-2xl">
                Join thousands of educators, students, and innovators who are revolutionizing education.
                Experience the power of gamified learning and see immediate results in engagement and achievement.
              </p>
            </div>

            <div className="flex flex-col gap-6 justify-center items-center sm:flex-row">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[--yellow-9] to-[--amber-9] rounded-lg opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                <Button variant="secondary" size="lg" className="relative font-bold bg-white transition duration-200 transform text-[--purple-9] hover:bg-gray-100 hover:scale-105">
                  <Zap className="mr-2 w-5 h-5" />
                  Start Free Trial
                  <Sparkles className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline" size="lg" className="text-white border-2 backdrop-blur-sm transition duration-200 transform border-white/30 hover:bg-white/10 hover:scale-105">
                <Globe className="mr-2 w-5 h-5" />
                Schedule Demo
                <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-lg opacity-90">
                📧 Ready to get started? Reach out to our team:
              </div>
              <div className="inline-block px-6 py-3 text-xl font-medium rounded-full backdrop-blur-sm bg-white/20">
                info@rewardsforeducation.com
              </div>
              <div className="text-sm opacity-70">
                🚀 Response time: Under 24 hours • 🌍 Available globally • 📞 24/7 support
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home