import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
    staleTime: 0, // Always refetch to get fresh data
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary calls
  });

  console.log("🔍 useAuthUser state:", {
    isLoading: authUser.isLoading,
    data: authUser.data,
    user: authUser.data?.user,
    error: authUser.error
  });

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};
export default useAuthUser;
