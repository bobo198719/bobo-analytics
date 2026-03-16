async function testUpload() {
    const url = 'http://srv1449576.hstgr.cloud:5000/api/upload-product';
    const formData = new FormData();
    
    // Create a mock blob/file
    const blob = new Blob(['fake-image-content'], { type: 'image/webp' });
    formData.append('image', blob, 'test.webp');
    formData.append('name', 'Test Cake');
    formData.append('price', '999');

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        console.log('Success:', result);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testUpload();
