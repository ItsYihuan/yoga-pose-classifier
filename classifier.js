// classifier.js

let selectedFile;

// Event listener for file input change
document.getElementById('fileInput').addEventListener('change', function (event) {
    selectedFile = event.target.files[0];
    displayImagePreview(selectedFile);
    document.getElementById('classifyButton').style.display = 'block';
});

// Display image preview
function displayImagePreview(file) {
    const imagePreview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = function (event) {
        imagePreview.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Event listener for classify button click
document.getElementById('classifyButton').addEventListener('click', function () {
    if (selectedFile) {
        loadAndClassifyImage(selectedFile);
    } else {
        alert('Please select an image file.');
    }
});

// Load and classify image
async function loadAndClassifyImage(file) {
    try {
        const tensor = await preprocessInputImage(file);
        const model = await loadModel();
        const prediction = await predictImage(model, tensor);
        displayResult(prediction);
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image. Please try again.');
    }
}

// Load image as TensorFlow tensor
async function loadImageTensor(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const img = new Image();
            img.onload = function () {
                const imageTensor = tf.browser.fromPixels(img);
                resolve(imageTensor);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Preprocess the input image
async function preprocessInputImage(file) {
    try {
        const imageTensor = await loadImageTensor(file);
        const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
        const expandedImage = tf.expandDims(resizedImage, 0);
        console.log('Image preprocessed');
        return expandedImage;
    } catch (error) {
        console.error('Error preprocessing image:', error);
        throw error;
    }
}

// Load the TensorFlow.js model
async function loadModel() {
    try {
        const model = await tf.loadLayersModel('./tfjs/model.json');
        console.log('Model loaded');
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

// Predict the image using the loaded model and preprocessed tensor
async function predictImage(model, tensor) {
    try {
        const result = model.predict(tensor);
        const predictedClassIndex = (await result.argMax(1).data())[0];
        const classes = ['bridge', 'childpose', 'downwarddog', 'lowlunge', 'plank', 'pyramid', 'reverse plank', 'seatedforwardbend', 'treepose', 'warriorII'];
        const predictedClass = classes[predictedClassIndex];
        console.log('Image predicted:', predictedClass);
        return predictedClass;
    } catch (error) {
        console.error('Error predicting image:', error);
        throw error;
    }
}

// Display the classification result
function displayResult(prediction) {
    document.getElementById('result').textContent = `Predicted Pose: ${prediction}`;
}
