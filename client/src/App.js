import React, { useEffect, useState } from "react"; 
import { Wheel } from "react-custom-roulette"; 
import useTelegram from './hooks/useTelegram';
import Button from './components/buttons'
// import images from './assets/images'

import "./styles.css";

export default function App() {
const {tg} = useTelegram()

  useEffect(()=>{
    tg.ready()
    console.log(tg) 
  },[tg])
  // useScript("https://telegram.org/js/telegram-web-app.js");
  const data = [
    { option: "", style: { backgroundColor: "hsl(0 0% 40%)", textColor: "white" }, chance: 80 },
    { option: "Лицо в гавно", style: { backgroundColor: "hsl(133 58% 39%)", textColor: "white" }, chance: 10 },
    { option: "Макияж", style: { backgroundColor: "hsl(43 74% 66%)", textColor: "white" }, chance: 30 },
    { option: "Скидка 50%", style: { backgroundColor: "hsl(16 37% 67%)", textColor: "white" }, chance: 40 },
    { option: "", style: { backgroundColor: "hsl(0 0% 40%)", textColor: "white" }, chance: 80 },
    { option: "Филлер 10гр", style: { backgroundColor: "hsl(320 60% 52%)", textColor: "white" }, chance: 45 },
    { option: "Брови", style: { backgroundColor: "hsl(91 43% 54%)", textColor: "white" }, chance: 60 },
    { option: "Губы", style: { backgroundColor: "hsl(140 36% 74%)", textColor: "white" }, chance: 50 }
  ];
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
 
  const handleSpinClick = () => {
    if (!mustSpin) {
      let arrChance = []
      let lotRand = Math.floor(spinertia(0, 100));
      for (let i = 0; i < data.length; i++) {
        console.log(data[i].chance, lotRand)
        if(lotRand < data[i].chance) {
          arrChance.push(data[i]) 
        } 
      }
      
      const newPrizeNumber = Math.floor(spinertia(0,arrChance.length - 1));
      console.log(arrChance,newPrizeNumber) 
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

// определяем количество оборотов, которое сделает наше колесо
const spinertia = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
 
  function stopSpin(e) {
    // let tg = window.Telegram.WebApp; //получаем объект webapp телеграма 
  
    tg.expand(); //расширяем на все окно 
    
    // tg.MainButton.text = "GUGA";
    console.log(e)
    console.log(tg) 
    tg.sendData(JSON.stringify({userinfo: tg.initDataUnsafe.user, prize: prizeNumber})); 
    console.log("stoppppppppp");
    setMustSpin(false);
  }
  return (
    <div className="App">
      <h1>Колесо фартуны Валерии Богдашкиной</h1>
      <h2>Крути колесо и получи свой приз!</h2>
      <Wheel
        prizeNumber={prizeNumber}
        mustStartSpinning={mustSpin}
        data={data} 
        textColors={["#fafef4"]}
        onStopSpinning={stopSpin}
        radiusLineWidth={1} 
        fontSize={20} 
        perpendicularText={false} 
        outerBorderWidth={5}  
      />
      <Button
        margin={"80px 0px 80px 0px"}
        color="#fff"
        text={'Крутить колесо'}
        onClick={handleSpinClick}
        // bg="red"
      />
    </div>
  );
}
