(function () {
    function initCookieNotice() {
        if (localStorage.getItem('cookiesAccepted')) return;

        const notice = document.createElement('div');
        notice.className = 'cookie-notice';
        notice.innerHTML = `
            <span>
                This website uses cookies to improve your experience and serve relevant ads. By continuing to use this site, you accept our use of cookies. 
                See our <a href="/privacy.html">Privacy Policy</a> for details.
            </span>
            <button id="acceptCookies">GOT IT</button>
        `;
        document.body.appendChild(notice);

        document.getElementById('acceptCookies').addEventListener('click', function () {
            localStorage.setItem('cookiesAccepted', 'true');
            notice.style.display = 'none';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieNotice);
    } else {
        initCookieNotice();
    }
})();
