import type { PlatformCopy } from "@/lib/platform";

const EXAMPLE_IG = "https://www.instagram.com/reel/CtjoC2BNsB2/";
const EXAMPLE_YT = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
const EXAMPLE_SHORT = "https://www.youtube.com/shorts/0PT5c1z3LL8";
const EXAMPLE_TT = "https://www.tiktok.com/@scout2015/video/6718335390845095173";

export const PLATFORMS_EN: PlatformCopy[] = [
  {
    id: "instagram",
    label: "Instagram",
    eyebrow: "Instagram Reels Downloader",
    title: "Download Instagram Reels.",
    lead: "Paste a public link. Original MP4 — no watermark, no login.",
    placeholder: "Paste an Instagram Reel or post",
    detectEmpty: "Reel, post or carousel — one link per field.",
    exampleUrls: [EXAMPLE_IG],
    quality: [{ id: "original", title: "Original", hint: "No logo" }],
    defaultQuality: "original",
    demoKind: "Reel",
    demoMeta: "Original · MP4",
    demoAuthor: "@atelier",
    demoBody: "A public Reel, no watermark — this is how the file lands on your phone.",
    demoImage: "/hero/rooftop.jpg",
    steps: [
      { title: "Copy the link", body: "In the Instagram app, share and copy the link." },
      { title: "Paste it here", body: "Paste fills this field from the clipboard." },
      { title: "Save", body: "Check the preview. iPhone: Save to Photos." },
    ],
    features: [
      { title: "No watermark", body: "The original file, not the share export with a logo." },
      { title: "Reels, posts, carousels", body: "Public clips and photos in one batch." },
      { title: "Batch of 12", body: "Several Instagram links in one run." },
      { title: "Built for phones", body: "Large tap targets and the iPhone share sheet." },
    ],
    guideTitle: "Download Instagram Reels in HD — no app, no logo.",
    guideLead:
      "Rille is an Instagram Reels downloader for public clips. You get the Reel as MP4, as published: vertical, no watermark, no Instagram account.",
    guide: [
      {
        title: "Reels, posts and carousels",
        body: "One public Instagram link is enough. Reels come as video, photos and carousels as separate files. Private profiles, Close Friends and login-gated Stories stay locked.",
      },
      {
        title: "MP4 downloader for your phone",
        body: "The field is large, so is the button. On iPhone, Save opens the share sheet — tap “Save to Photos”. Android and desktop start a file download.",
      },
      {
        title: "No watermark instead of the share export",
        body: "The share link from the app often ships a logo. Rille fetches the public original. The picture stays clean — as long as the post is public.",
      },
      {
        title: "Only if you’re allowed",
        body: "The downloader is a tool, not a license. Save Reels only when you have the right to. Rille does not bypass protections.",
      },
    ],
    faq: [
      {
        question: "Can I download Instagram Reels without the app?",
        answer:
          "Yes. Copy the public link, paste it above and save the Reel as MP4. No Instagram account needed.",
      },
      {
        question: "Can I download Instagram Reels in HD?",
        answer: "Rille fetches the public original file — at the resolution Instagram serves, without a logo.",
      },
      {
        question: "Is the Instagram download free?",
        answer: "Yes. Rille needs no account and no payment. Public files, no ads in the tool.",
      },
      {
        question: "Does it work on iPhone?",
        answer: "Yes. Save opens the share sheet. Choose “Save to Photos” or “Save to Files”.",
      },
      {
        question: "Which Instagram links don’t work?",
        answer:
          "Private profiles, Close Friends and login-gated Stories. Public Reels, posts and videos are the core.",
      },
      {
        question: "May I save someone else’s Reels?",
        answer: "Only if you’re allowed to. Rille is not a license and does not bypass locks.",
      },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    eyebrow: "YouTube Video Downloader",
    title: "YouTube videos as MP4.",
    lead: "Paste a watch or Short link. MP4 in 1080p, 720p or 360p — if the clip actually has that quality.",
    placeholder: "Paste a YouTube video or Short",
    detectEmpty: "Watch URL or Short — one link per field.",
    exampleUrls: [EXAMPLE_YT, EXAMPLE_SHORT],
    quality: [
      { id: "1080", title: "1080p", hint: "If available" },
      { id: "720", title: "720p", hint: "Balanced" },
      { id: "360", title: "360p", hint: "Saves data" },
    ],
    defaultQuality: "1080",
    demoKind: "YouTube",
    demoMeta: "MP4 · requested quality",
    demoAuthor: "Me at the zoo",
    demoBody: "Video or Short as MP4. We label the real resolution, not a guess.",
    demoImage: "/hero/projector.jpg",
    steps: [
      { title: "Copy the link", body: "From YouTube — video, Short or youtu.be." },
      { title: "Pick a quality", body: "1080p, 720p or 360p, if the clip offers it." },
      { title: "Save", body: "MP4 lands on the device. iPhone: Save to Photos." },
    ],
    features: [
      { title: "Honest quality labels", body: "We read the file. No fake 1080p on a 240p clip." },
      { title: "Videos and Shorts", body: "Watch links and vertical Shorts in one tool." },
      { title: "Batch of 12", body: "Several YouTube links, one queue." },
      { title: "No account", body: "No login, no ads in the tool." },
    ],
    guideTitle: "YouTube video downloader — clips and Shorts as MP4.",
    guideLead:
      "Rille saves public YouTube videos as MP4. No converter account, no extension. You pick 1080p, 720p or 360p before saving — we only promise a tier if the file really has it.",
    guide: [
      {
        title: "Save a YouTube Short as MP4",
        body: "Paste a Shorts URL or youtu.be. Rille keeps the vertical MP4 so it plays natively on a phone.",
      },
      {
        title: "1080p only when the clip has it",
        body: "We probe the file. If YouTube only published 240p, the label says so. 720p saves storage, 360p saves data.",
      },
      {
        title: "For iPhone and Android",
        body: "Large field, one clear button. On iPhone: Save, then “Save to Photos”. On a computer the download starts directly.",
      },
      {
        title: "What will not load",
        body: "Age-restricted, private and many live streams stay locked. Rille does not bypass YouTube protections. Only save what you’re allowed to.",
      },
    ],
    faq: [
      {
        question: "What quality do YouTube videos come in?",
        answer:
          "As MP4 at the resolution the file actually has. We don’t invent 1080p. Shorts stay vertical.",
      },
      {
        question: "Can I save a YouTube Short as MP4?",
        answer: "Yes. Paste the Shorts URL — Rille detects it and returns a vertical MP4.",
      },
      {
        question: "Is the YouTube download free?",
        answer: "Yes. No account, no payment. Public videos and Shorts only.",
      },
      {
        question: "Does it work on iPhone?",
        answer: "Yes. Save opens the share sheet. Choose “Save to Photos” or “Save to Files”.",
      },
      {
        question: "Which YouTube links fail?",
        answer: "Age-restricted, private and many live streams. Public videos and Shorts work.",
      },
      {
        question: "May I save someone else’s YouTube videos?",
        answer: "Only if you’re allowed to. The downloader is a tool, not a license.",
      },
    ],
  },
  {
    id: "tiktok",
    label: "TikTok",
    eyebrow: "TikTok Video Downloader",
    title: "TikTok without watermark.",
    lead: "Paste a public link. HD MP4 without the logo, optional audio as MP3.",
    placeholder: "Paste a TikTok link",
    detectEmpty: "Video link from the TikTok app — including vm.tiktok.com.",
    exampleUrls: [EXAMPLE_TT],
    quality: [
      { id: "1080", title: "HD", hint: "No logo" },
      { id: "original", title: "Standard", hint: "No logo" },
      { id: "audio", title: "Audio", hint: "MP3" },
    ],
    defaultQuality: "1080",
    demoKind: "TikTok",
    demoMeta: "HD · no watermark",
    demoAuthor: "@scout2015",
    demoBody: "A public TikTok as a clean MP4 — no logo on the picture.",
    demoImage: "/hero/musician.jpg",
    steps: [
      { title: "Copy the link", body: "In TikTok tap Share, then Copy link." },
      { title: "Paste it here", body: "One field per clip. Batch with extra links." },
      { title: "Save without logo", body: "HD or standard as MP4. iPhone: Save to Photos." },
    ],
    features: [
      { title: "No watermark", body: "The clean file, not the share export with a logo." },
      { title: "HD MP4", body: "Highest public tier, plus standard and audio." },
      { title: "Short links", body: "vm.tiktok.com and vt.tiktok.com too." },
      { title: "Batch of 12", body: "Several TikToks in one run." },
    ],
    guideTitle: "Download TikTok videos without a watermark.",
    guideLead:
      "Rille is a TikTok video downloader for public clips. You get an MP4 without the logo — HD if TikTok offers it — plus the audio as MP3 if you want.",
    guide: [
      {
        title: "No logo, not the share export",
        body: "The link from the TikTok app often points at a watermarked file. Rille fetches the public original.",
      },
      {
        title: "HD, standard and audio",
        body: "HD first. Standard if you want a smaller file. Audio saves only the sound as MP3.",
      },
      {
        title: "Short links and batches",
        body: "vm.tiktok.com and vt.tiktok.com resolve. Up to twelve public links in one run, one field per clip.",
      },
      {
        title: "iPhone and permission",
        body: "Save opens the iPhone share sheet. Private and deleted clips stay locked. Only save what you’re allowed to.",
      },
    ],
    faq: [
      {
        question: "Can I save TikToks without a watermark?",
        answer: "Yes. Rille fetches the public original without the logo — HD if TikTok offers it.",
      },
      {
        question: "Is the TikTok download free?",
        answer: "Yes. No account, no payment. Public videos only.",
      },
      {
        question: "Does the TikTok downloader work on iPhone?",
        answer: "Yes. Save opens the share sheet. Choose “Save to Photos” or “Save to Files”.",
      },
      {
        question: "Do I need a TikTok account?",
        answer: "No. Only a public link. Private and deleted clips stay locked.",
      },
      {
        question: "Does vm.tiktok.com work?",
        answer: "Yes. Short links from vm.tiktok.com and vt.tiktok.com are resolved.",
      },
      {
        question: "May I save someone else’s TikToks?",
        answer: "Only if you’re allowed to. Rille is a tool, not a license, and does not bypass locks.",
      },
    ],
  },
];
