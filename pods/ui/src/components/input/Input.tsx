type InputProps = {
  placeholder: 'text';
  type: 'text';
};

const Input = ({ placeholder, type }: InputProps) => {
  return <input placeholder={placeholder} type={type} />;
};

export default Input;
