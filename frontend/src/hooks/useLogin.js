import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("🎉 Login successful! Response:", data);
      
      // Show success message
      toast.success("Welcome back!");
      
      // Update the query cache immediately with the user data
      if (data.user) {
        queryClient.setQueryData(["authUser"], { user: data.user });
        console.log("✅ Updated auth user in cache:", data.user);
      }
      
      // Navigate based on onboarding status
      const targetRoute = data.user?.isOnboarded ? "/" : "/onboarding";
      console.log("🚀 Navigating to:", targetRoute);
      navigate(targetRoute);
    },
    onError: (error) => {
      console.log("❌ Login failed:", error);
      toast.error(error.response?.data?.message || "Failed to login");
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
