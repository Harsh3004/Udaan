import React from 'react'

export const HighlightedText = ({color,children}) => {
  return (
    <span className={color}>
        {" " + children + " "}
    </span>
  )
}
