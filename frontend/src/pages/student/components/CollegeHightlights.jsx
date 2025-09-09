import { Card, Badge, Heading, Text, Flex, Box } from "@radix-ui/themes";
import { Award, TrendingUp, Star } from "lucide-react";

export default function HighlightsSection({ college }) {
  return (
    <>
      {(college.highlight1 || college.highlight2 || college.highlight3) && (
        <div className="py-6">

          {/* Section Header */}
          <div className="relative z-10 mb-6">
            <div className="inline-block mb-4">
              <Badge size="3" variant="soft" className="font-semibold tracking-wide uppercase">
                Excellence Showcase
              </Badge>
            </div>
            <Heading size="7" className="mb-4 font-bold" color="cyan">
              Why Choose {college.name}?
            </Heading>
            <Text size="3" color="gray" className="mx-auto max-w-3xl font-medium leading-relaxed">
              Discover the exceptional advantages that set {college.name} apart in higher education
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {college.highlight1 && (
              <Card size="3" className="relative z-10 shadow-lg transition duration-300 hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[--blue-a2] to-[--blue-a4]"/>
                <Flex direction="column" align="center" gap="3" className="text-center">
                  <Box className="p-3 bg-[--blue-a3] rounded-full">
                    <Award size={24} className="text-[--blue-11]" />
                  </Box>
                  <Text as="p" size="3" weight="medium" color="blue">
                    {college.highlight1}
                  </Text>
                </Flex>
              </Card>
            )}
            {college.highlight2 && (
              <Card size="3" className="relative z-10 shadow-lg transition duration-300 hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[--green-a2] to-[--green-a4]"/>
                <Flex direction="column" align="center" gap="3" className="text-center">
                  <Box className="p-3 bg-[--green-a3] rounded-full">
                    <TrendingUp size={24} className="text-[--green-11]" />
                  </Box>
                  <Text as="p" size="3" weight="medium" color="green">
                    {college.highlight2}
                  </Text>
                </Flex>
              </Card>
            )}
            {college.highlight3 && (
              <Card size="3" className="relative z-10 shadow-lg transition duration-300 hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[--purple-a2] to-[--purple-a4]"/>
                <Flex direction="column" align="center" gap="3" className="text-center">
                  <Box className="p-3 bg-[--purple-a3] rounded-full">
                    <Star size={24} className="text-[--purple-11]" />
                  </Box>
                  <Text as="p" size="3" weight="medium" color="purple">
                    {college.highlight3}
                  </Text>
                </Flex>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
}
