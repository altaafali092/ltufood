import { Head, usePage } from "@inertiajs/react";
import WelcomeComponent from "../components/Frontend/Welcome";
import { FoodItem } from "@/types/frontend/Index";

interface PageProps {
  foodItems: FoodItem[];
  canRegister: boolean;
}

const WelcomePage = () => {
  const { foodItems, canRegister } = usePage<PageProps>().props;

  return (
    <>
      <Head title="LTU Food" />
      <WelcomeComponent
        foodItems={foodItems}
        canRegister={canRegister}
      />
    </>
  );
};

export default WelcomePage;