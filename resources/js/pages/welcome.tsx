import { Head, usePage } from "@inertiajs/react";
import WelcomeComponent from "../components/Frontend/Welcome";
import { FoodItem, SharedCart } from "@/types/frontend/Index";

interface PageProps {
  foodItems: FoodItem[];
  canRegister: boolean;
  cart?: SharedCart;
}

const WelcomePage = () => {
  const { foodItems, canRegister, cart } = usePage<PageProps>().props;

  return (
    <>
      <Head title="LTU Food" />
      <WelcomeComponent
        foodItems={foodItems}
        canRegister={canRegister}
        cart={cart}
      />
    </>
  );
};

export default WelcomePage;