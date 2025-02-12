function toggleMenu() {
    document.getElementById("menu").classList.toggle("open");
}

function redirect(page) {
    window.location.href = page + ".html";
}

//API vers spotify : 

const clientId = '88e563ce42b94305a3f710a82e3b14cc'; // Remplacez par votre Client ID
        const clientSecret = 'b73cc8ef9dcd4c9d9b6b89e810fdaeac'; // Remplacez par votre Client Secret

        async function getAccessToken() {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });
            const data = await response.json();
            return data.access_token;
        }

        async function searchTrack(query) {
            const accessToken = await getAccessToken();
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            const data = await response.json();
            return data.tracks.items;
        }

        function displayResults(tracks) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';
            tracks.forEach(track => {
                const trackDiv = document.createElement('div');
                trackDiv.className = 'track';
                trackDiv.innerHTML = `
                    <img src="${track.album.images[0].url}" alt="${track.name}" width="50">
                    <div>
                        <strong>${track.name}</strong><br>
                        ${track.artists.map(artist => artist.name).join(', ')}
                    </div>
                `;
                resultsDiv.appendChild(trackDiv);
            });
        }

        document.getElementById('searchForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const query = document.getElementById('searchQuery').value;
            const tracks = await searchTrack(query);
            displayResults(tracks);
        });


//Carrousselle --> 

document.addEventListener('DOMContentLoaded', function () {
    new Glide('.glide1', { type: 'carousel', autoplay: 3000, hoverpause: true, perView: 3, gap: 20, breakpoints: { 800: { perView: 2 }, 500: { perView: 1 } } }).mount();
    new Glide('.glide2', { type: 'carousel', autoplay: 3000, hoverpause: true, perView: 3, gap: 20, breakpoints: { 800: { perView: 2 }, 500: { perView: 1 } } }).mount();
});