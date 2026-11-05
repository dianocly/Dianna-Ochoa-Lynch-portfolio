/* Reuse the existing media in the mobile reading flow; restore its exact
   original position when returning to the desktop breakpoint. */
(() => {
    const mobile = window.matchMedia('(max-width: 880px)');
    const plans = {
        sebastian: [[null, [0]], ['Acrylic prototype', [1]], ['Metal assembly', [2]], ['Second redesign', [3]], ['Field testing', [5, 4]], ['Competition performance', [6]]],
        finger: [[null, [11]], ['Prototype 1', [0]], ['Prototype 2', [1, 2]], ['Prototype 3', [3, 4]], ['Prototype 4', [5]], ['Capstan gearbox', [6, 7, 8]], ['Further development', [9, 10]]],
        cadenza: [[null, [2]], ['System-level goals', [0, 1]], ['Refinement and on-robot', [3]], ['Arm and intake arm rebuild', [5]], ['Spare strategy', [4, 6]], ['What I learned', [7, 8, 9]]],
        exoskeleton: [[null, [2]], ['Design criteria via', [0]], ['Artificial muscle concept', [1]], [false, [3]]],
        aegaeon: [[null, [0]], ['Process and iterations', [1]], ['Pneumatic geometry', [2]], ['Version 1', [3]], ['Redesign', [4]], ['Season performance', [5]]],
        glacier: [[null, [0]], ['Process and iterations', [1]], ['Version 1', [2, 3]], ['Finite Element Analysis', [4]], ['Performance issues', [5]], ['Global ranking', [7]], [false, [6]]],
        'early-work': [[null, [0]], ['What I learned', [1]]]
    };
    const moved = [];
    const groups = [];
    const galleries = [];

    function move(node, destination) {
        const marker = document.createComment('Original media position');
        node.before(marker);
        moved.push({ node, marker });
        destination.append(node);
    }

    function groupAt(prose, heading, nodes) {
        const target = heading === null ? prose.firstElementChild : heading === false ? null :
            [...prose.children].find(el => /^(H3|P)$/.test(el.tagName) && el.textContent.trim().startsWith(heading));
        if (heading && !target) return;
        const group = document.createElement('div');
        group.className = 'mobile-project-media';
        prose.insertBefore(group, target);
        groups.push(group);
        nodes.forEach(node => move(node, group));
        return group;
    }

    function restore() {
        moved.forEach(({ node, marker }) => marker.replaceWith(node));
        groups.forEach(group => group.remove());
        galleries.forEach(gallery => gallery.classList.remove('mobile-gallery-source'));
        moved.length = groups.length = galleries.length = 0;
    }

    function arrange() {
        restore();
        if (!mobile.matches) return;
        for (const [id, plan] of Object.entries(plans)) {
            const section = document.getElementById(id);
            const body = section?.querySelector('.project-body');
            const prose = body?.firstElementChild;
            const gallery = body?.querySelector('.project-gallery');
            if (!prose || !gallery) continue;
            const photos = [...gallery.querySelectorAll('img')].map(img => img.parentElement.tagName === 'A' ? img.parentElement : img);
            plan.forEach(([heading, indices]) => groupAt(prose, heading, indices.map(i => photos[i]).filter(Boolean)));
            // Hide only emptied galleries, so an unmatched future image remains visible.
            if (!gallery.querySelector('img')) {
                gallery.classList.add('mobile-gallery-source');
                galleries.push(gallery);
            }
            if (id === 'sebastian') {
                const interview = document.getElementById('sebastian-interview');
                if (interview) {
                    const firstHeading = [...prose.children].find(el => el.tagName === 'H3');
                    groupAt(prose, firstHeading?.textContent.trim(), [interview]);
                }
            }
        }
        const bd = document.querySelector('#boston-dynamics .project-body');
        const portrait = bd?.querySelector('.experience-project-photo');
        if (portrait) groupAt(bd.firstElementChild, null, [portrait]);
    }

    mobile.addEventListener('change', arrange);
    arrange();
})();
