async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    const video = document.querySelector('#viewfinder');
    video.srcObject = stream;
    video.play();
  } catch (err) {
    console.error('Camera error:', err);
    alert('Could not access camera. Please allow permission.');
  }
}



function capturePhoto() {
 const countdown = document.querySelector('#snapBtn');
  let count = 3;

 
  countdown.textContent = count;
  countdown.style.display = 'block';

  const timer = setInterval(() => {
    count--;

    if (count > 0) {
      countdown.textContent = count;  
    } else {
      clearInterval(timer);         
      countdown.textContent = '';  
      
      setTimeout(() => {
        countdown.style.display = 'none'; 
        capturePhoto();                     
      }, 500);
    }
  }, 1000);
}
