import React from 'react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Badge, Box, Grid, Heading } from '@radix-ui/themes';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { FALLBACK_IMAGES } from '../utils/constants';
import { Link } from 'react-router';

function FeaturedTasksCarousel({ featuredTasks, role }) {
  return (
    <div className='overflow-hidden rounded-2xl shadow-md'>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          prevEl: '.swiper-nav-prev',
          nextEl: '.swiper-nav-next',
        }
        }
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={featuredTasks.length > 1}
        grabCursor
        className="mySwiper"
      >
        {
          featuredTasks.map((task) => {
            const taskImage = task.attachments?.find(attachment => attachment.type === 'image');
            return (
              <SwiperSlide key={task._id} className='w-full max-w-full rounded-2xl'>
                <Link
                  to={`/${role}/tasks/${task._id}`}
                >
                  <Box className="relative p-3 md:p-6">
                    {/* Background with sophisticated gradient */}
                    <Box className="absolute inset-0 bg-gradient-to-bl from-[--accent-4] via-[--accent-5] to-[--accent-6]" />

                    {/* Geometric pattern overlay */}
                    <Box
                      className="absolute inset-0 z-0 bg-center bg-cover opacity-30"
                      style={{
                        backgroundImage: `url("https://static.vecteezy.com/system/resources/thumbnails/056/062/481/small_2x/ethereal-blue-and-white-abstract-background-photo.jpg")`
                      }}
                    />

                    {/* Main content */}
                    <Grid className="relative z-10 gap-4 md:gap-6" columns={'3'} >

                      {/* Left image section */}
                      <Box className="col-span-1 max-w-64" >
                        <Box className="relative">
                          {/* Main product image */}
                          <Box className="overflow-hidden relative rounded-xl">
                            <img
                              src={taskImage?.url || FALLBACK_IMAGES.landscape}
                              alt={taskImage?.name || 'Task attachment'}

                              className="object-cover object-center w-full h-full aspect-square bg-[--accent-contrast]"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMAGES.landscape;
                              }}
                            />

                            {/* Image overlay gradient */}
                            <Box className="absolute inset-0 bg-gradient-to-t to-transparent from-black/10" />
                          </Box>
                        </Box>
                      </Box>

                      {/* Right content section */}
                      <Box className="flex flex-col col-span-2 gap-2 h-full sm:gap-3 md:gap-4">
                        {/* Title with modern typography */}
                        <Heading
                          size={{ initial: '3', sm: '4', md: '6' }}
                          weight="bold"
                          className="mb-1 line-clamp-2"
                        >
                          {task.title}
                        </Heading>

                        {/* Points badge */}
                        <Badge size={{ initial: '2', sm: '3' }} highContrast variant='solid' className='self-start'>
                          {task.pointValue} Scholarship Points
                        </Badge>
                      </Box>
                    </Grid>
                  </Box>
                </Link>
              </SwiperSlide>
            )
          })
        }
      </Swiper>
    </div >
  )
}

export default FeaturedTasksCarousel
