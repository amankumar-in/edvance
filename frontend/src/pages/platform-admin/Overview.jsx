import { Flex, Select, Separator, Text, Card, Box, Button, IconButton, Grid } from '@radix-ui/themes'
import React from 'react'
import { Users, UserPlus, UserMinus, CheckSquare, Gift, Plus, School, GraduationCap, UserCircle2 } from 'lucide-react'

function Overview() {
  return (
    <div>
      <section className='flex flex-col gap-6'>        
        <Flex gap="4" wrap="wrap">
          {/* Total Users Card */}
          <Card className="flex-1 lg:max-w-sm min-w-[250px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2">
                <Box className="p-2 rounded-full bg-[--indigo-3]">
                  <Users className="text-[--indigo-9]" size={22} />
                </Box>
                <Text weight="medium" size="3">Total Users</Text>
              </Flex>
              <Text size="7" weight="bold">5,782</Text>
              <Text size="1" color="gray">All platform users</Text>
            </Flex>
          </Card>
          
          {/* User Types Breakdown Card */}
          <Card className="flex-1 min-w-[250px]">
            <Flex direction="column" gap="2" p="4">
              <Flex align="center" gap="2" mb="1">
                <Box className="p-2 rounded-full bg-[--gray-3]">
                  <UserCircle2 className="text-[--gray-9]" size={22} />
                </Box>
                <Text weight="medium" size="3">User Breakdown</Text>
              </Flex>
              
              <Grid className='gap-4 lg:grid-cols-2'>
                <Flex align="center" justify="between"  gap={'2'} className="pb-2">
                  <Flex align="center" gap="2">
                    <GraduationCap size={16} className="text-[--purple-9]" />
                    <Text size="2">Students</Text>
                  </Flex>
                  <Text size="3" weight="bold">3,247</Text>
                </Flex>
                <Flex align="center" justify="between" gap={'2'} className="pb-2">
                  <Flex align="center" gap="2">
                    <Users size={16} className="text-[--blue-9]" />
                    <Text size="2">Teachers</Text>
                  </Flex>
                  <Text size="3" weight="bold">872</Text>
                </Flex>
                <Flex align="center" justify="between" gap={'2'} className="pb-2">
                  <Flex align="center" gap="2">
                    <UserCircle2 size={16} className="text-[--green-9]" />
                    <Text size="2">Parents</Text>
                  </Flex>
                  <Text size="3" weight="bold">1,450</Text>
                </Flex>
                <Flex align="center" justify="between" gap={'2'} className="pb-2">
                  <Flex align="center" gap="2">
                    <School size={16} className="text-[--amber-9]" />
                    <Text size="2">Schools</Text>
                  </Flex>
                  <Text size="3" weight="bold">213</Text>
                </Flex>
              </Grid>
            </Flex>
          </Card>
        </Flex>
        <Flex gap="4" wrap="wrap">
          {/* Active Tasks Card */}
          <Card className="flex-1 min-w-[250px] max-w-sm">
            <Flex direction="column" gap="3" p="4">
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Box className="p-2 rounded-full bg-[--purple-3]">
                    <CheckSquare className="text-[--purple-9]" size={22} />
                  </Box>
                  <Text weight="medium" size="3">Active Tasks</Text>
                </Flex>
                <IconButton size="3" variant="ghost">
                  <Plus size={20} />
                </IconButton>
              </Flex>
              <Text size="7" weight="bold">24</Text>
              {/* <Text size="2" color="gray">Currently available to students</Text> */}
            </Flex>
          </Card>
          
          {/* Active Rewards Card */}
          <Card className="flex-1 min-w-[250px] max-w-sm">
            <Flex direction="column" gap="3" p="4">
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Box className="p-2 rounded-full bg-[--cyan-3]">
                    <Gift className="text-[--cyan-9]" size={22} />
                  </Box>
                  <Text weight="medium" size="3">Active Rewards</Text>
                </Flex>
                <IconButton size="3" variant="ghost">
                  <Plus size={20} />
                </IconButton>
              </Flex>
              <Text size="7" weight="bold">16</Text>
              {/* <Text size="2" color="gray">Currently available for redemption</Text> */}
            </Flex>
          </Card>
        </Flex>
      </section>
      
      <Separator size={'4'} className="my-6" />
      
      <section className='mt-4'>
        <Flex justify='between' align='center' gap='2'>
          <Text
            as='h2'
            size={'6'}
            weight={'medium'}
          >
            App Activity
          </Text>

          <Select.Root defaultValue="daily">
            <Select.Trigger />
            <Select.Content variant="soft" position='popper'>
              <Select.Item value="daily">Daily</Select.Item>
              <Select.Item value="weekly">Weekly</Select.Item>
              <Select.Item value="monthly">Monthly</Select.Item>
              <Select.Item value="yearly">Yearly</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex gap="4" mt="4" wrap="wrap">
          {/* Active Users Card */}
          <Card className="flex-1 min-w-[250px]">
            <Flex direction="column" gap="3" p="4">
              <Flex align="center" gap="2">
                <Box className="p-2 rounded-full bg-[--green-3]">
                  <Users className="text-[--green-9]" size={22} />
                </Box>
                <Text weight="medium" size="3">Active Users</Text>
              </Flex>
              <Text size="7" weight="bold">1,257</Text>
              {/* <Flex align="center" gap="2">
                <Box className="text-[--green-9]">+8.2%</Box>
                <Text size="1" color="gray">vs previous period</Text>
              </Flex> */}
            </Flex>
          </Card>
          
          {/* New Users Card */}
          <Card className="flex-1 min-w-[250px]">
            <Flex direction="column" gap="3" p="4">
              <Flex align="center" gap="2">
                <Box className="p-2 rounded-full bg-[--blue-3]">
                  <UserPlus className="text-[--blue-9]" size={22} />
                </Box>
                <Text weight="medium" size="3">New Users</Text>
              </Flex>
              <Text size="7" weight="bold">342</Text>
              {/* <Flex align="center" gap="2">
                <Box className="text-[--green-9]">+12.4%</Box>
                <Text size="1" color="gray">vs previous period</Text>
              </Flex> */}
            </Flex>
          </Card>
          
          {/* Inactive Users Card */}
          <Card className="flex-1 min-w-[250px]">
            <Flex direction="column" gap="3" p="4">
              <Flex align="center" gap="2">
                <Box className="p-2 rounded-full bg-[--amber-3]">
                  <UserMinus className="text-[--amber-9]" size={22} />
                </Box>
                <Text weight="medium" size="3">Inactive Users</Text>
              </Flex>
              <Text size="7" weight="bold">89</Text>
              {/* <Flex align="center" gap="2">
                <Box className="text-[--red-9]">+2.1%</Box>
                <Text size="1" color="gray">vs previous period</Text>
              </Flex> */}
            </Flex>
          </Card>
        </Flex>
      </section>
    </div>
  )
}

export default Overview
