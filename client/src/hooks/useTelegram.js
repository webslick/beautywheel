
const tg = window.Telegram.WebApp

const useTelegram = url => {

  const onClose = () => {
    tg.close();
  }

  const onToggleButton = () => {
    if(tg.MainButton.isVisible) {
      tg.MainButton.hide();
    } else {
      tg.MainButton.show();
    }
  }


  return {
    tg,
    onClose,
    onToggleButton,
    user: tg.initDataUnsafe?.user,
  }

};

export default useTelegram;