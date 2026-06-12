/* Feed cards without a feature image fall back to the first image found in the
 * post body. post-card.hbs renders the post content into an inert <template>
 * (so its images aren't fetched and scripts don't run); here we extract the
 * first usable <img> and promote it to the card thumbnail, or drop the figure
 * so the card renders with no image.
 *
 * This must handle cards added later by infinite-scroll pagination (pagination.js
 * fetches the next page and appends cloned cards), so as well as processing the
 * initial cards we watch each feed for appended ones. */
(function () {
    function resolve(figure) {
        if (!figure || figure.dataset.fallbackResolved) { return; }
        figure.dataset.fallbackResolved = '1';

        var card = figure.closest('.gh-card');
        var tpl = figure.querySelector('template');
        var source = tpl && tpl.content ? tpl.content.querySelector('img[src]') : null;

        if (source) {
            var img = document.createElement('img');
            img.src = source.getAttribute('src');
            if (source.getAttribute('srcset')) { img.srcset = source.getAttribute('srcset'); }
            if (source.getAttribute('sizes')) { img.sizes = source.getAttribute('sizes'); }
            img.alt = source.getAttribute('alt') || '';
            img.loading = 'lazy';

            figure.innerHTML = '';
            figure.appendChild(img);
            figure.hidden = false;

            // {{post_class}} tags every feature-image-less post with `no-image`,
            // which makes the theme apply its imageless card layout. We now have
            // an image, so drop it and let the card style like any image card.
            if (card) { card.classList.remove('no-image'); }
        } else {
            // No image anywhere in the post → render the card without a thumbnail
            if (card) { card.classList.add('no-image'); }
            if (figure.parentNode) { figure.parentNode.removeChild(figure); }
        }
    }

    function process(root) {
        if (!root || !root.querySelectorAll) { return; }
        Array.prototype.forEach.call(root.querySelectorAll('.gh-card-image-fallback'), resolve);
    }

    // Cards present on initial page load.
    process(document);

    // Cards appended later by infinite-scroll pagination.
    if (window.MutationObserver) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                    if (node.nodeType !== 1) { return; }
                    if (node.matches && node.matches('.gh-card-image-fallback')) {
                        resolve(node);
                    } else {
                        process(node);
                    }
                });
            });
        });
        Array.prototype.forEach.call(document.querySelectorAll('.gh-feed'), function (feed) {
            observer.observe(feed, { childList: true });
        });
    }
})();
