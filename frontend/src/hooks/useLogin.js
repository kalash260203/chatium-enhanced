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
      // Invalidate the auth user query to refetch the user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Show success message
      toast.success("Welcome back!");
      
      // Navigate based on onboarding status
      setTimeout(() => {
        if (data.user && data.user.isOnboarded) {
          navigate("/");
        } else {
          navigate("/onboarding");
        }
      }, 100); // Small delay to ensure query invalidation is processed
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to login");
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
