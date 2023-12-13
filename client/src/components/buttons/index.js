import React from 'react';
import './index.css';

function Button(props) {
  const { text, color, bg, size, margin, onClick } = props;
  return(
    <div style={{ margin }} >
      <div style={{ color, backgroundColor: bg, fontSize: `${size}px` }} className="btn-spin" onClick={() => onClick()}>{ text }</div>
    </div>
  );
}

export default Button;