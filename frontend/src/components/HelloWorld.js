// import React from 'react';

// // Define a functional component that accepts props
// function HelloWorld(props) {
//   return (
//     <div>
//       <h1>Hello, {props.name}!</h1>  {/* Use the name prop */}
//       <p>{props.message}</p>  {/* Use the message prop */}
//     </div>
//   );
// }

// // Export the component
// export default HelloWorld;



import React from 'react';

function HelloWorld(props) {
  return (
    <div>
      {/* Map over the array of names and create an <h1> for each */}
      {props.names.map((name, index) => (
        <h1 key={index}>Hello, {name}!</h1>  // Use index as a key to ensure unique IDs
      ))}
    </div>
  );
}
export default HelloWorld;
