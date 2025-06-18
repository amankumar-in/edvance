import { Badge, Box, Button, Callout, Card, Dialog, Flex, Grid, Heading, IconButton, Select, Spinner, Text, TextField } from '@radix-ui/themes';
import { AlertCircleIcon, Clock, Gift, Heart, Search, ShoppingCart, Sparkles, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useDebounce } from '../../hooks/useDebounce';
// Import Swiper styles
import { useInView } from 'react-intersection-observer';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAuth } from '../../Context/AuthContext';
import { usePointsDetailsById } from '../../api/points/points.queries';
import { useRedeemReward } from '../../api/rewards/rewards.mutations';
import { useGetAllRewardsInfinite } from '../../api/rewards/rewards.queries';
import { EmptyStateCard, Loader } from '../../components';
import { toast } from 'sonner';

function StudentRewards() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedReward, setSelectedReward] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const { ref, inView } = useInView()

  // Data - Student ID
  const { profiles, user } = useAuth();
  const studentId = profiles?.student?._id;

  // Queries ------------------------------------------------
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useGetAllRewardsInfinite({
    limit: 3,
    search: debouncedSearchQuery,
    order: sortBy === 'price-low' ? 'asc' : 'desc',
  })

  // Data - All Rewards
  const allRewards = data?.pages?.flatMap(page => page.data.rewards) || [];

  // Data - Featured Rewards
  const featuredRewards = allRewards?.filter(reward => reward.isFeatured) || [];

  // Data - Point Account
  const { data: pointAccountData, isLoading: isLoadingPointAccount, isError: isErrorPointAccount, error: errorPointAccount } = usePointsDetailsById(studentId);
  const pointAccount = pointAccountData?.data ?? {};

  // Mutations ------------------------------------------------
  const { mutate: redeemReward, isPending: isRedeemingReward } = useRedeemReward();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  // Mock data - replace with actual API calls
  const userPoints = pointAccount?.currentBalance ?? 0;


  const toggleWishlist = (rewardId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(rewardId)) {
      newWishlist.delete(rewardId);
    } else {
      newWishlist.add(rewardId);
    }
    setWishlist(newWishlist);
  };

  const canAfford = (pointsCost) => userPoints >= pointsCost;

  if (isLoading) return (
    <Flex justify='center' align='center'>
      <Loader />
    </Flex>
  );

  if (isError) return (
    <Callout.Root color='red'>
      <Callout.Icon>
        <AlertCircleIcon size={16} />
      </Callout.Icon>
      <Callout.Text>
        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching user details'}
      </Callout.Text>
    </Callout.Root>
  );


  return (
    <Box className='space-y-6' >
      {/* Header Section */}
      <Box>
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center" wrap={'wrap'} gap={'4'} >
            <div>
              <Text size="7" weight="bold">
                Rewards Store
              </Text>
              <Text size="3" color="gray" className="block mt-2">
                Redeem your scholarship points for amazing rewards
              </Text>
            </div>
            <Card>
              <Flex align="center" gap="4">
                <Trophy className="text-[--yellow-9]" size={24} />
                <Text as='p' size="1" className="opacity-80">Your Points</Text>
                <Text as='p' size="5" weight="bold">{userPoints.toLocaleString()}</Text>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Box>

      {/* Featured Rewards Banner */}
      <Box className="relative flex-1">
        <Box className="overflow-hidden rounded-xl md:rounded-2xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              prevEl: '.swiper-nav-prev',
              nextEl: '.swiper-nav-next',
            }}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active'
            }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop={true}
            grabCursor
            className="mySwiper"
          >
            {featuredRewards.map((reward) => (
              <SwiperSlide key={reward.id} className='!w-full !max-w-full'>
                <Box className="relative">
                  {/* Background with sophisticated gradient */}
                  <Box className="absolute inset-0 bg-gradient-to-br from-[--accent-2] via-[--accent-3] to-[--accent-4]" />

                  {/* Geometric pattern overlay */}
                  <Box
                    className="absolute inset-0 opacity-[0.02] md:opacity-[0.05]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='15' height='15' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 15 0 L 0 0 0 15' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='url(%23grid)'/%3E%3C/svg%3E")`
                    }}
                  />

                  {/* Main content */}
                  <Flex className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[380px] ">
                    {/* Left content section */}
                    <Box className="flex flex-col justify-center flex-1 h-full p-4 sm:p-6 md:p-8 lg:p-12">

                      {/* Title with modern typography */}
                      <Heading
                        size={{ initial: '6', sm: '7', md: '8' }}
                        weight="bold"
                        className="text-[--gray-12] mb-2 leading-tight tracking-tight"
                      >
                        {reward.title}
                      </Heading>

                      {/* Description */}
                      <Text
                        size={{ initial: '2', sm: '3', md: '4' }}
                        className="text-[--gray-11] mb-4 md:mb-6 max-w-sm md:max-w-md"
                      >
                        {reward.description}
                      </Text>

                      {/* Stats row */}
                      <Flex
                        direction={{ initial: 'column', sm: 'row' }}
                        gap={{ initial: '2', sm: '3', md: '4' }}
                        className="mb-4 md:mb-6"
                        wrap="wrap"
                      >
                        {/* Points card */}
                        <div className='flex justify-center bg-gradient-to-r from-[--accent-9] to-[--accent-10] rounded-lg align-center text-[--accent-contrast]'>
                          <Flex align="center" gap={{ initial: '2', md: '3' }} className="px-3 py-2 md:px-4 md:py-3">
                            <Box className="flex items-center justify-center w-8 h-8 rounded-full md:w-10 md:h-10 bg-white/20">
                              <Trophy size={16} className="text-white md:w-5 md:h-5" />
                            </Box>
                            <Box>
                              <Text as='p' size="1" className="font-medium uppercase">
                                Points Required
                              </Text>
                              <Text size={{ initial: '3', md: '4' }} weight="bold">
                                {reward.pointsCost.toLocaleString()}
                              </Text>
                            </Box>
                          </Flex>
                        </div>

                        {/* Limited quantity warning */}
                        {reward.limitedQuantity && (
                          <div className='flex justify-center bg-gradient-to-r from-[--red-9] to-[--red-10] rounded-lg align-center text-[--accent-contrast]'>
                            <Flex align="center" gap={{ initial: '2', md: '3' }} className="px-3 py-2 md:px-4 md:py-3">
                              <Box className="flex items-center justify-center w-8 h-8 rounded-full md:w-10 md:h-10 bg-white/20">
                                <Clock size={16} />
                              </Box>
                              <Box>
                                <Text as='p' size="1" className="font-medium tracking-wide uppercase">
                                  Limited Stock
                                </Text>
                                <Text size={{ initial: '2', md: '3' }} weight="bold">
                                  Only {reward.quantity} left
                                </Text>
                              </Box>
                            </Flex>
                          </div>
                        )}
                      </Flex>

                      {/* Action buttons */}
                      <Flex gap={{ initial: '2', md: '3' }} align="center" direction={{ initial: 'column', sm: 'row' }}>
                        <Button
                          size={{ initial: '3', md: '4' }}
                          className={`font-medium md:font-semibold px-4 md:px-8 py-2 md:py-3 shadow-md md:shadow-lg transition-all duration-300 w-full sm:w-auto ${canAfford(reward.pointsCost)
                            ? 'bg-gradient-to-r from-[--accent-9] to-[--accent-10] text-white hover:shadow-xl hover:scale-105'
                            : 'bg-[--gray-6] text-[--gray-11] cursor-not-allowed'
                            }`}
                          disabled={!canAfford(reward.pointsCost)}
                          onClick={() => setSelectedReward(reward)}
                        >
                          <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
                          <Text className="hidden sm:inline">
                            {canAfford(reward.pointsCost) ? 'Redeem Now' : 'Insufficient Points'}
                          </Text>
                          <Text className="sm:hidden">
                            {canAfford(reward.pointsCost) ? 'Redeem' : 'Not Enough'}
                          </Text>
                        </Button>

                        <IconButton
                          size={{ initial: '3', md: '4' }}
                          variant="soft"
                          className="bg-[--gray-4] hover:bg-[--gray-5] text-[--gray-11] hover:text-red-500 transition-all duration-300"
                          onClick={() => toggleWishlist(reward.id)}
                        >
                          <Heart
                            size={16}
                            className={`md:w-[18px] md:h-[18px] transition-all duration-300 ${wishlist.has(reward.id) ? 'fill-red-500 text-red-500 scale-110' : ''
                              }`}
                          />
                        </IconButton>
                      </Flex>
                    </Box>

                    {/* Right image section - Hidden on mobile, visible on md+ */}
                    <Box className="items-center justify-center hidden p-6 md:flex lg:p-8 ">
                      <Box className="relative">
                        {/* Main product image */}
                        <Box className="relative overflow-hidden shadow-xl rounded-xl lg:rounded-2xl lg:shadow-2xl">
                          <img
                            loading='lazy'
                            src={reward.image}
                            alt={reward.title}
                            className="object-cover w-48 transition-transform duration-700 aspect-scale lg:w-64 lg:h-64 xl:w-72 hover:scale-110"
                          />

                          {/* Image overlay gradient */}
                          <Box className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                        </Box>

                        {/* Floating elements */}
                        <Box className="absolute flex items-center justify-center w-12 h-12 rounded-full shadow-lg -top-3 -right-3 lg:-top-4 lg:-right-4 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 lg:shadow-xl animate-bounce">
                          <Sparkles size={20} className="text-white lg:w-6 lg:h-6" />
                        </Box>

                        {/* Price tag */}
                        <Box className="absolute -bottom-3 -left-3 lg:-bottom-4 lg:-left-4 bg-[--color-background] rounded-lg lg:rounded-xl shadow-lg lg:shadow-xl p-2 lg:p-3 border border-[--gray-6]">
                          <Flex align="center" gap="2">
                            <Trophy size={14} className="lg:w-4 lg:h-4 text-[--accent-9]" />
                            <Text size={{ initial: '1', lg: '2' }} weight="bold" className="text-[--gray-12]">
                              {reward.pointsCost.toLocaleString()}
                            </Text>
                          </Flex>
                        </Box>
                      </Box>
                    </Box>
                  </Flex>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box>
        <Flex gap="4" align='center' wrap={'wrap'}>
          {/* Search */}
          <Box className="flex-1 min-w-[200px]">
            <TextField.Root
              size={{ initial: '2', md: '3' }}
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}>
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {/* Sort */}
          <Select.Root size={{ initial: '2', md: '3' }} value={sortBy} onValueChange={setSortBy}>
            <Select.Trigger>
              Sort by
            </Select.Trigger>
            <Select.Content variant='soft' position='popper'>
              <Select.Item value="price-low">Price: Low to High</Select.Item>
              <Select.Item value="price-high">Price: High to Low</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Box>

      {/* Rewards Grid */}
      <Flex justify="between" align="center" wrap={'wrap'} gap={'2'}>
        <Text as='p' size="2" color="gray" className='flex items-center gap-2'>
          Showing {allRewards.length} rewards <Spinner loading={isFetching} />
        </Text>
        <Flex align="center" gap="2">
          <Text size="2" color="gray">Your balance:</Text>
          <Badge color="green" variant="soft" size="2">
            <Trophy size={12} />
            {userPoints.toLocaleString()} points
          </Badge>
        </Flex>
      </Flex>


      {allRewards.length > 0 ? (
        <>
          <Grid columns={{ initial: '1', xs: '2', sm: '2', lg: '3', xl: '4' }} gap="4">
            {allRewards.map((reward) => (
              <Card
                size='1'
                key={reward._id}
                className="flex flex-col transition-shadow cursor-pointer hover:shadow-md"
                onClick={() => setSelectedReward(reward)}
              >
                <Box className="relative">
                  <img
                    src={reward.image}
                    alt={reward.title}
                    loading='lazy'
                    className="object-cover object-center w-full rounded-md aspect-video"
                    onError={(e) => {
                      // Fallback to hide the image if it fails to load
                      e.target.style.display = 'none';
                    }}
                  />
                  {reward.badge && (
                    <Box className="absolute top-2 left-2">
                      <Badge color="red" variant="solid" size="1">
                        {reward.badge}
                      </Badge>
                    </Box>
                  )}
                  <IconButton
                    variant="soft"
                    color="gray"
                    size="1"
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(reward._id);
                    }}
                  >
                    <Heart
                      size={14}
                      className={wishlist.has(reward._id) ? 'fill-[--red-9] text-[--red-9]' : 'text-white'}
                    />
                  </IconButton>
                  {reward.limitedQuantity && (
                    <Box className="absolute bottom-2 left-2">
                      <Badge color="orange" variant="solid" size="1">
                        <Clock size={10} />
                        Only {reward.quantity} left
                      </Badge>
                    </Box>
                  )}
                </Box>

                <Box mt={'4'} className='flex flex-col justify-between flex-1'>
                  <div>
                    <Flex align="center" gap="2" className="mb-2">
                      <Text size="1" color="gray" className="capitalize">
                        {reward.subcategory}
                      </Text>
                    </Flex>

                    <Heading size="3" className="mb-2 line-clamp-2">
                      {reward.title}
                    </Heading>

                    <Text size="2" color="gray" className="mb-3 line-clamp-2">
                      {reward.description}
                    </Text>

                    <Flex justify="between" align="center" className="mb-3">
                      <Flex align="center" gap="1">
                        <Trophy size={14} />
                        <Text as='p' size="4" weight="bold">
                          {reward.pointsCost.toLocaleString()}
                        </Text>
                      </Flex>
                      {reward.expiryDate && (
                        <Flex align="center" gap="1">
                          <Clock size={12} className="text-orange-500" />
                          <Text size="1" color="orange">
                            Expires {new Date(reward.expiryDate).toLocaleDateString()}
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  </div>
                  <Button
                    size="2"
                    className="w-full disabled:cursor-not-allowed"
                    disabled={!canAfford(reward.pointsCost)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReward(reward);
                    }}
                  >
                    <ShoppingCart size={16} />
                    {canAfford(reward.pointsCost) ? 'Redeem Now' : 'Not Enough Points'}
                  </Button>
                </Box>
              </Card>
            ))}
          </Grid>

          {isFetchingNextPage && (
            <Flex justify='center' align='center'>
              <Loader />
            </Flex>
          )}
          {(hasNextPage && !isFetchingNextPage) && <div ref={ref}></div>}
          {!hasNextPage && !isFetchingNextPage && (
            <Flex justify='center' align='center'>
              <Text as='p' size="1" color="gray" className='text-nowrap' >No more rewards to show</Text>
            </Flex>
          )}
        </>
      ) : (
        <EmptyStateCard
          title='No rewards found'
          description='Try adjusting your search or filter criteria'
          icon={<Gift />}
        />
      )}

      {/* Reward Detail Modal */}
      <Dialog.Root open={!!selectedReward} onOpenChange={() => {
        if (isRedeemingReward) return;
        setSelectedReward(null);
      }}>
        <Dialog.Content className='max-w-4xl' aria-describedby={undefined}>
          {selectedReward && (
            <>
              <Dialog.Title>{selectedReward.title}</Dialog.Title>
              <Flex direction={{ initial: 'column', sm: 'row' }} gap="4" align="start">
                <img
                  loading='lazy'
                  src={selectedReward.image}
                  alt={selectedReward.title}
                  className="object-cover object-center w-full rounded-lg md:w-1/2 aspect-video"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />

                <div className='flex-1 space-y-2'>
                  <Flex align="center" gap="2">
                    <Text as='p' size="2" color="gray" className="capitalize">
                      {selectedReward.subcategory} • {selectedReward.category}
                    </Text>
                    {selectedReward.badge && (
                      <Badge color="red" variant="soft" size="1">
                        {selectedReward.badge}
                      </Badge>
                    )}
                  </Flex>

                  <Text as='p'>{selectedReward.description}</Text>

                  <Flex justify="between" align="center" className="p-4 bg-[--gray-a2] rounded-lg">
                    <Box>
                      <Text as='p' size="2" color="gray">Points Required</Text>
                      <Flex align="center" gap="1">
                        <Trophy size={16} />
                        <Text as='p' size="4" weight="bold" >
                          {selectedReward.pointsCost.toLocaleString()}
                        </Text>
                      </Flex>
                    </Box>
                    <Box className="text-right">
                      <Text as='p' size="2" color="gray">Your Balance</Text>
                      <Text as='p' size="3" weight="bold">
                        {userPoints.toLocaleString()}
                      </Text>
                    </Box>
                  </Flex>

                  {selectedReward.limitedQuantity && (
                    <Callout.Root variant='surface' color='orange'>
                      <Callout.Icon>
                        <Clock size={16} />
                      </Callout.Icon>
                      <Callout.Text>
                        Limited quantity: Only {selectedReward.quantity} remaining
                      </Callout.Text>
                    </Callout.Root>
                  )}

                  {selectedReward.expiryDate && (
                    <Callout.Root variant='surface' color='yellow'>
                      <Callout.Icon>
                        <Clock size={16} />
                      </Callout.Icon>
                      <Callout.Text>
                        Expires on {new Date(selectedReward.expiryDate).toLocaleDateString()}
                      </Callout.Text>
                    </Callout.Root>
                  )}
                </div>
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button disabled={isRedeemingReward} variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  disabled={!canAfford(selectedReward.pointsCost) || isRedeemingReward}
                  onClick={() => {
                    redeemReward({
                      id: selectedReward._id,
                      studentId
                    }, {
                      onSuccess: () => {
                        toast.success('Reward redeemed successfully');
                        setSelectedReward(null);
                      },
                      onError: (error) => {
                        toast.error(error?.response?.data?.message || error?.message || 'Failed to redeem reward');
                      }
                    });
                  }}
                  className='disabled:cursor-not-allowed'
                >
                  <ShoppingCart size={16} />
                  {canAfford(selectedReward.pointsCost)
                    ? isRedeemingReward
                      ? 'Processing...'
                      : 'Confirm Redemption'
                    : 'Not Enough Points'
                  }
                </Button>
              </Flex>
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>

    </Box>
  );
}

export default StudentRewards;





