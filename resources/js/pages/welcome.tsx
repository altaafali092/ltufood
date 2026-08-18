import { Head, usePage } from "@inertiajs/react";
import WelcomeComponent from "../components/Frontend/Welcome";
import { FoodItem } from "@/types/frontend/Index";
import { CartItem, SharedData } from "@/types";

interface PageProps {
  foodItems: FoodItem[];
  canRegister: boolean;
  cartItems:CartItem[];
}

const WelcomePage = ({ foodItems, canRegister, cartItems }:PageProps) => {
  const pageProps = usePage<SharedData>().props;
  const { totalQuantity, totalPrice } = pageProps;

  // #region agent log
  fetch('http://127.0.0.1:7327/ingest/45e0cf67-6a30-4803-92f7-6b976922c8c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4a7485'},body:JSON.stringify({sessionId:'4a7485',location:'welcome.tsx:render',message:'welcome page cart props',data:{authUser:pageProps.auth?.user?.name??null,totalQuantity,cartItemsLen:Array.isArray(cartItems)?cartItems.length:0,sharedCartItemsLen:Array.isArray(pageProps.cartItems)?pageProps.cartItems.length:0},timestamp:Date.now(),hypothesisId:'H3-H5'})}).catch(()=>{});
  // #endregion

  return (
    <>
      <Head title="LTU Food" />
      <WelcomeComponent
        foodItems={foodItems}
        // canRegister={canRegister}
        cartItems={cartItems}
        totalQuantity={totalQuantity}
        totalPrice={totalPrice}
      />
    </>
  );
};

export default WelcomePage;