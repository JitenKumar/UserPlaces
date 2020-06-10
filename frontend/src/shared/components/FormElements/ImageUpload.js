import React,{useRef,useState,useEffect} from "react";
import Button from "./Button";
import "./ImageUpload.css";
const ImageUpload = (props) => {
    const [file,setFile] = useState();
    const [filePreviewURL,setFilewPreviewURL]= useState();
    const [isValid,setIsValid] = useState(false);
    const filePickerRef = useRef();
    const pickImageHandler = ()=>{  
        filePickerRef.current.click(); 
    }
    useEffect(() => {
      if (!file) {
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setFilewPreviewURL(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }, [file]);
    const pickedFileHandler=event=>{
        let pickedFile;
        let fileIsValid=isValid;
        if(event.target.files && event.target.files.length===1){
            pickedFile = event.target.files[0];
            setFile(pickedFile);
            setIsValid(true);
            fileIsValid=true;
        }else{
            setIsValid(false);
            fileIsValid=false;
        }
        props.onInput(props.id,pickedFile,fileIsValid);
    }
  return (
    <div className="form-control">
      <input
        type="file"
        ref={filePickerRef}
        id={props.id}
        style={{ display: "none" }}
        accept=".jpg,.png,.jpeg"
        onChange={pickedFileHandler}
      ></input>
      <div className={`image-upload || ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {filePreviewURL && <img src={filePreviewURL} alt="Preview"></img>}
          {!filePreviewURL && <p>Please Pick an Image ***</p>}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          Pick Image
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
