# Vizabi DDF Service Reader

This Vizabi DDF Service Reader is used to connect your Vizabi visualization to data that is published by a [DDF Service](https://github.com/Gapminder/big-waffle/blob/master/SERVICE_SPEC.md).  

## Usage

To use the reader include the script:

    <script src="dist/ vizabi-ddf-service-reader.js"></script>

Then simply create an instance and pass it to Vizabi. 

    var ddfReader = DDFServiceReader.getReader();
    Vizabi.Reader.extend("ddfbw", ddfReader);

Then configure Vizabi to provide the reader with the URL of the DDF Service and the name of the dataset:

    Object.assign(ConfigPopByAge, {
    data: {
        "reader": "ddfbw",
        "service": "https://big-waffle.gapminder.org",
        "dataset": "population"
    },
    locale: {
        "filePath": "//s3-eu-west-1.amazonaws.com/static.gapminderdev.org/vizabi/develop/assets/translation/"
    }
    });

    Vizabi("PopByAge", document.getElementById("vizabi"), ConfigPopByAge);
