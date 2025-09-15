import { Button, Text } from '@radix-ui/themes';
import { ArrowRight, BookOpenCheck, Check, GraduationCap, Landmark, UsersRound } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { APP_NAME } from '../../utils/constants';

// User roles with icons
export const roleOptions = [
  {
    id: 'student',
    title: 'Student',
    icon: GraduationCap,
    gradient: ['#FF8DA1', '#FF6B85'],
  },
  {
    id: 'parent',
    title: 'Parent',
    icon: UsersRound,
    gradient: ['#FFC2BA', '#FFAD9F'],
  },
  {
    id: 'teacher',
    title: 'Teacher',
    icon: BookOpenCheck,
    gradient: ['#FF9CE9', '#FF7DE0'],
  },
  {
    id: 'school_admin',
    title: 'School Admin',
    icon: Landmark,
    gradient: ['#AD56C4', '#9548A8'],
  },
];

function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    navigate(`/register?role=${selectedRole}`);
  };

  return (
    <div className="relative z-10 space-y-6 w-full max-w-md text-white rounded-2xl">
      <div className="text-center">
        <Text as="p" size={'8'} weight={'bold'} className='drop-shadow'>
          Welcome to {APP_NAME}
        </Text>
        <Text as="p" size={'4'} mt={'4'}>
          Let's start by selecting your role
        </Text>
      </div>

      {/*Role Selection Cards */}
      <div className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
        }}
      >
        {roleOptions.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 py-3 text-white shadow hover:shadow-lg transition-all border rounded-2xl flex-col flex justify-center ${isSelected ? 'border-[--gray-6]' : 'bg-gradient-to-br from-white/10 to-white/20 border-[--gray-8]'} relative focus:outline-none focus-visible:ring-2 ring-[--focus-8]`}
              style={{
                background:
                  selectedRole === role.id
                    ? `linear-gradient(to right, ${role.gradient[0]}, ${role.gradient[1]})`
                    : undefined,
              }}
            >
              {/* Check icon */}
              {isSelected && <div className='absolute top-3 right-3'>
                <Check size={18} />
              </div>}

              {/* Icon and text */}
              <div className="flex flex-col gap-4 items-center">
                <div className="flex justify-center items-center rounded-full size-14"
                  style={{
                    background:
                      isSelected
                        ? 'transparent' // neutral or faded when selected
                        : `linear-gradient(to right, ${role.gradient[0]}, ${role.gradient[1]})`,
                  }}
                >
                  {role.icon && <role.icon className='size-8' />}
                </div>
                <Text as="span" weight="medium" align="center" className='drop-shadow'>
                  {role.title}
                </Text>
              </div>
            </button>

          )
        })}
      </div>

      {selectedRole && (
        <div className='text-center'>
          <Button
            onClick={handleContinue}
            size={'4'}
            className='w-full shadow-md group'
          >
            Continue <ArrowRight size={18} className='transition-transform duration-300 group-hover:translate-x-1' />
          </Button>
        </div>
      )}
      <Text as="p" size={'2'} align={'center'}>
        Already have an account?{" "}
        <Link
          to={'/login'}
          className="hover:underline">
          <Text as="span" weight={'medium'}>
            Login
          </Text>
        </Link>
      </Text>
    </div>
  )
}

export default RoleSelection