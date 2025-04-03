import { useState } from "react";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Axios from "axios";
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

const Cloudinary_test = () => {
    const [publicId, setPublicId] = useState(null);

    const uploadImage = (files) => {
        const formData = new FormData()
        formData.append("file", files[0])
        formData.append("upload_preset", "rnvyghre")

        Axios.post("https://api.cloudinary.com/v1_1/dpszia6xf/image/upload", formData).then((response) => {
            setPublicId(response.data.public_id);
            console.log(response)});
    }


    const cld = new Cloudinary({ cloud: { cloudName: 'dpszia6xf' } });

    const img = cld
          .image(publicId)
          .format('auto')
          .quality('auto')
          .resize(auto().gravity(autoGravity()).width(100).height(100));
  

    return (
        <div>
            <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            >
            Upload files
            <VisuallyHiddenInput
                type="file"
                onChange={(event) => {
                    uploadImage(event.target.files)
                }}
                multiple
            />
            </Button>
            <AdvancedImage cldImg={img}/>
        </div>
      );
}

export default Cloudinary_test;