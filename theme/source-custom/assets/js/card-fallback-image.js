/* Feed cards without a feature image fall back to the first image found in the
 * post body. post-card.hbs renders the post content into an inert <template>
 * (so its images aren't fetched and scripts don't run); here we extract the
 * first usable <img> and promote it to the card thumbnail, or drop the figure
 * entirely so the card renders with no image. */
(function () {
    var figures = document.querySelectorAll('.gh-card-image-fallback');

    Array.prototype.forEach.call(figures, function (figure) {
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
        } else {
            // No image anywhere in the post → render the card without a thumbnail
            if (card) { card.classList.add('no-image'); }
            if (figure.parentNode) { figure.parentNode.removeChild(figure); }
        }
    });
})();
