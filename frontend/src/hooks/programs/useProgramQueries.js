import { getAllCategories, getPublishedPrograms } from "../../services/programs/program.service";

export const usePublishedPrograms = () => {
  return useQuery({
    queryKey: ["programs", "published"],
    queryFn: getPublishedPrograms,
    staleTime: 1000 * 60 * 5,
  });

};

 
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 5,
  });
};