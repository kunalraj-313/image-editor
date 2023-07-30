import React, { useState } from 'react';
import './styles.css'


export default function ColorPalette() {

  const [colors, setColors] = useState({
    primary: {
      state: true,
      color:'#000000'
    },
    secondary: {
      state: false,
      color:'#FFFFFF'
    }
  })
const colorsGrid = [
  '#000000',
  '#7F7F7F',
  '#880015',
  '#ED1C24',
  '#FF7F27',
  '#FFF200',
  '#22B14C',
  '#00A2E8',
  '#3F48CC',
  '#A349A4',
  '#FFFFFF',
  '#C3C3C3',
  '#B97A57',
  '#FFAEC9',
  '#FFC90E',
  '#EFE4B0',
  '#B5E61D',
  '#99D9EA',
  '#7092BE',
  '#C8BFE7'
  ];
  const handleColors = (color) => {

    if (colors.primary.state) {
    setColors(prevState => ({ ...prevState, primary: { ...prevState.primary, color: color } }))
    } else {
    setColors(prevState => ({ ...prevState, secondary: { ...prevState.secondary, color: color } }))
      
    }
              
  }



  const handleColorState = (type) => {
  if (type === 'primary') {
    setColors(prevState => ({
      ...prevState,
      primary: { ...prevState.primary, state: true },
      secondary: { ...prevState.secondary, state: false }
    }));
  } else {
    setColors(prevState => ({
      ...prevState,
      primary: { ...prevState.primary, state: false },
      secondary: { ...prevState.secondary, state: true }
    }));
  }
};


  return (
    <div className='color-palette'>
      <div className='color-primary-secondary'>
        <div className='color-primary' onClick={()=>handleColorState('primary')} style={colors.primary.state ? {border: '2px solid white',background: colors.primary.color} : {border:'',background: colors.primary.color}}>
          
        </div>
        <div className='color-secondary'  onClick={()=>handleColorState('secondary')} style={colors.secondary.state ?  {border: '2px solid white',background: colors.secondary.color} : {border:'',background: colors.secondary.color}}>

        </div>
      </div>
      <div className='color-grid'>
        {
          colorsGrid.map(c => {
            return (
              <div className='grid-item' style={{background:c}} onClick={()=>handleColors(c)} key={c}>
              </div>
            )
          })
        }
      </div>
             <input
         type="color"
         value={colors.primary.state ? colors.primary.color : colors.secondary.color}
         onChange={(e) => handleColors(e.target.value)}
      />
    </div>
  )
}
