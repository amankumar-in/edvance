import { Button, Text } from "@radix-ui/themes";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../Context/AuthContext";
import AuthLayout from "./AuthLayout";

function SelectProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { handleLogout, setActiveRole, selectionList, setSelectionList } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    if (state?.selectionList) {
      setSelectionList(state.selectionList);
    }
  }, [state?.selectionList]);

  const handleContinue = () => {
    if (!selectedProfile) return;

    setActiveRole(selectedProfile.value);
    localStorage.setItem('activeRole', selectedProfile.value);
    navigate(selectedProfile.route)
  };

  return (
    <AuthLayout>
      <div className="relative z-10 w-full max-w-md space-y-6 text-[--gray-1] rounded-2xl">
        <div className="text-center">
          <Text as="p" size={"7"} weight={"bold"}>
            Select Your Profile
          </Text>
          <Text as="p" size={"3"} mt={"2"}>
            Choose which profile you want to use
          </Text>
        </div>

        <ul className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
          }}
        >
          {selectionList.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => setSelectedProfile(item)}
                className={`w-full hover:shadow-lg p-4 h-20 shadow rounded-xl text-white border transition-all ${selectedProfile?.value === item.value
                  ? "bg-gradient-to-r from-[--brand-blue] via-[--brand-purple] to-[--brand-pink] border-[--gray-6]"
                  : "  bg-gradient-to-br from-white/10 to-white/20 border-[--gray-8]"
                  }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {selectedProfile && <div className="text-center">
          <Button size={'4'} className='w-full shadow-md group' disabled={!selectedProfile} onClick={handleContinue}>
            Continue <ArrowRight size={18} className='shadow-md transition-transform duration-300 group-hover:translate-x-1' />
          </Button>
        </div>}

        {/* Link to log out and switch accounts */}
        <Text as="div" align={"center"} size={'2'}>
          Want to use a different account?{" "}
          <Link
            to={"/login"}
            className="hover:underline"
            onClick={handleLogout}
          >
            <Text as="span" weight={"medium"}>
              Log out
            </Text>
          </Link>
        </Text>
      </div>
    </AuthLayout>
  );
}

export default SelectProfile; 