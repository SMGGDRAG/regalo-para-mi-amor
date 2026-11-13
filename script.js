const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Contador automático desde el primer día juntos.
function updateDayCount() {
  const start = new Date(Date.UTC(2024, 5, 10));
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const days = Math.max(0, Math.floor((today - start) / 86400000));
  $('#days-count').textContent = new Intl.NumberFormat('es').format(days);
}
updateDayCount();

// Aparición suave al recorrer la página.
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Barra de lectura en la parte superior.
function updateScrollProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const progress = available > 0 ? (window.scrollY / available) * 100 : 0;
  $('#scroll-progress').style.width = `${Math.min(100, progress)}%`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// Alterna entre el tema cálido de día y el tema noche.
$('#theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('night');
  $('#theme-toggle').textContent = document.body.classList.contains('night') ? '☾' : '☼';
});

// Archivos de medios organizados con nombres estables.
const galleryPhotos = [
  'portada.jpg',
  ...Array.from({ length: 31 }, (_, index) => `foto-${String(index + 1).padStart(2, '0')}.${index === 30 ? 'webp' : 'jpg'}`),
  'polaroid.jpg',
  'juntos.jpg',
];
const galleryVideos = ['video-01.mp4', 'video-02.mp4', 'video-03.mp4'];

// Crea la galería a partir del inventario; las fotos son diferidas y los vídeos no precargan datos.
const gallery = $('#media-gallery');
function makePhotoTile(filename, index) {
  const figure = document.createElement('figure');
  figure.className = `media-tile${index % 8 === 0 ? ' media-tall' : ''}`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'media-photo';
  button.setAttribute('aria-label', `Ampliar foto ${String(index + 1).padStart(2, '0')}`);
  const image = document.createElement('img');
  image.src = `media/${filename}`;
  image.alt = `Recuerdo ${String(index + 1).padStart(2, '0')} de Santiago y su pareja`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.remove();
    button.classList.add('media-missing');
    button.textContent = `No se encontró ${filename}`;
  }, { once: true });
  button.append(image);
  const caption = document.createElement('figcaption');
  const number = document.createElement('span');
  number.textContent = `FOTO ${String(index + 1).padStart(2, '0')}`;
  const label = document.createElement('strong');
  label.textContent = index === 0 ? 'El comienzo de esta galería' : 'Un instante de nuestra historia';
  caption.append(number, label);
  figure.append(button, caption);
  button.addEventListener('click', () => openLightbox(image.src, image.alt));
  return figure;
}
function makeVideoTile(filename, index) {
  const figure = document.createElement('figure');
  figure.className = `media-tile media-video-tile${index === 1 ? ' media-video-wide' : ''}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'media-video-frame';
  const video = document.createElement('video');
  video.src = `media/${filename}`;
  video.controls = true;
  video.preload = 'none';
  video.playsInline = true;
  video.setAttribute('aria-label', `Video recuerdo ${String(index + 1).padStart(2, '0')}`);
  wrapper.append(video);
  const caption = document.createElement('figcaption');
  const number = document.createElement('span');
  number.textContent = `VIDEO ${String(index + 1).padStart(2, '0')}`;
  const label = document.createElement('strong');
  label.textContent = 'Un recuerdo en movimiento';
  caption.append(number, label);
  figure.append(wrapper, caption);
  return figure;
}
galleryPhotos.forEach((filename, index) => gallery.append(makePhotoTile(filename, index)));
galleryVideos.forEach((filename, index) => gallery.append(makeVideoTile(filename, index)));
$('#media-count').textContent = `${galleryPhotos.length} fotos · ${galleryVideos.length} videos`;

// Visor accesible de fotos: Escape o el botón cierran la imagen.
const lightbox = $('#lightbox');
const lightboxImage = $('#lightbox-image');
const lightboxCaption = $('#lightbox-caption');
function openLightbox(src, caption) {
  lightboxCaption.textContent = caption;
  lightboxImage.hidden = false;
  lightboxImage.alt = caption;
  lightboxImage.src = src;
  lightboxImage.onerror = () => {
    lightboxImage.hidden = true;
    lightboxCaption.textContent = `No se pudo abrir esta foto: ${src}`;
  };
  lightbox.showModal();
}
$('#lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

// Sobres: mensajes cortos para distintos días.
$$('.envelope').forEach((envelope) => envelope.addEventListener('click', () => {
  $('#note-text').textContent = envelope.dataset.message;
  $('#note-reveal').hidden = false;
  $('#note-reveal').scrollIntoView({ behavior: 'smooth', block: 'center' });
}));
$('#close-note').addEventListener('click', () => { $('#note-reveal').hidden = true; });

// Generador de plan para una cita juntos.
const datePlans = [
  { icon: '☾', title: 'Noche de película', description: 'Elige una peli mala, prepara algo rico y nos reímos de cada escena.', tag: 'EN CASA · SIN PRISA' },
  { icon: '✳', title: 'Paseo sin destino', description: 'Salimos a caminar, elegimos una calle al azar y encontramos algo rico por el camino.', tag: 'AFUERA · MANO CON MANO' },
  { icon: '♡', title: 'Cita de cafetería', description: 'Un café, algo dulce y una conversación de esas que hacen que se pase la tarde volando.', tag: 'CAFÉ · POSTRE · NOSOTROS' },
  { icon: '⌁', title: 'Cocinamos algo nuevo', description: 'Buscamos una receta, ponemos música y aceptamos que la cocina puede quedar hecha un caos.', tag: 'AVENTURA CULINARIA' },
  { icon: '☼', title: 'Atardecer para dos', description: 'Llevamos algo para picar, buscamos un buen lugar y vemos cómo termina el día.', tag: 'HORA DORADA · SIN CELULAR' },
  { icon: '✎', title: 'Intercambio de cartas', description: 'Escribimos tres cosas que amamos del otro y las leemos juntos, sin apuro.', tag: 'PAPEL · TINTA · CORAZÓN' },
];
let currentPlan = 0;
$('#plan-button').addEventListener('click', () => {
  let next = Math.floor(Math.random() * datePlans.length);
  if (datePlans.length > 1 && next === currentPlan) next = (next + 1) % datePlans.length;
  currentPlan = next;
  const plan = datePlans[currentPlan];
  $('#plan-number').textContent = `IDEA ${String(currentPlan + 1).padStart(3, '0')}`;
  $('#plan-icon').textContent = plan.icon;
  $('#plan-title').textContent = plan.title;
  $('#plan-description').textContent = plan.description;
  $('#plan-tag').textContent = plan.tag;
  $('.date-card').animate([{ opacity: .5, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
});

// Pon aquí un enlace específico de Google Maps para el lugar de su primer beso.
const GOOGLE_MAPS_LINK = 'https://www.google.com/maps/place/Rafaello/@-0.3130166,-78.4729286,2500a,75y,307.8h,92.55t/data=!3m7!1e1!3m5!1sTWfbIRQt4GYnEZaVMxFdGg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-2.5471271635060333%26panoid%3DTWfbIRQt4GYnEZaVMxFdGg%26yaw%3D307.80225803679014!7i16384!8i8192!4m6!3m5!1s0x91d5bd35720d512f:0x4a7d0eb2bcc14f6e!8m2!3d-0.3128919!4d-78.4730203!16s%2Fg%2F11vt7vqb_k?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D';
$('#map-link').href = GOOGLE_MAPS_LINK;

// La sorpresa final: tres preguntas de recuerdos.
const quizQuestions = [
  { question: '¿Dónde fue nuestro primer beso?', answers: ['Heladería', 'Parque', 'Restaurante'] },
  { question: '¿Quién dijo “te quiero” primero?', answers: ['Yo', 'Tú', 'Los dos a la vez'] },
  { question: '¿Cuándo supimos que esto iba en serio?', answers: ['Nuestra primera salida juntos', 'Cuando nos quedamos hablando hasta muy tarde', 'El día en que nos dimos nuestro primer abrazo largo en un restaurante'] },
];
let currentQuestion = 0;
function renderQuestion() {
  const item = quizQuestions[currentQuestion];
  $('#quiz-progress').innerHTML = `RECUERDO 0${currentQuestion + 1} <span>·</span> 0${quizQuestions.length}`;
  $('#quiz-progressbar').style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
  $('#quiz-question').textContent = item.question;
  $('#quiz-feedback').textContent = '';
  $('#quiz-answers').replaceChildren(...item.answers.map((answer) => {
    const button = document.createElement('button');
    button.className = 'quiz-answer';
    button.type = 'button';
    button.textContent = answer;
    button.addEventListener('click', () => {
      currentQuestion += 1;
      if (currentQuestion === quizQuestions.length) {
        $('#quiz').hidden = true;
        $('#win').hidden = false;
        $('#win').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        renderQuestion();
      }
    });
    return button;
  }));
}
$('#surprise-button').addEventListener('click', () => {
  $('#surprise-button').hidden = true;
  $('.finale-intro').hidden = true;
  $('#quiz').hidden = false;
  renderQuestion();
});
