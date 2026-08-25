const config = window.TBDDR_CONFIG || {};
const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;
const listingBucket = config.listingBucket || "listing-photos";

const state = {
  listings: load("thebellydancedressingroom-listings", []),
  saved: load("thebellydancedressingroom-saved", []),
  chats: load("thebellydancedressingroom-chats", []),
  activeInquiry: null,
  inquiryMessages: [],
  session: null,
  profile: null,
  isAdmin: false,
  filters: {
    style: "",
    designer: "",
    color: "",
    size: "",
    location: ""
  },
  filter: "all",
  query: "",
  marketPage: 1,
  savedPage: 1
};

const realListings = state.listings.filter((listing) => {
  return !String(listing.id).startsWith("seed-") && listing.image !== "public/catalog-dresses.png";
}).map(normalizeListing);

if (realListings.length !== state.listings.length) {
  state.listings = realListings;
  state.saved = state.saved.filter((id) => realListings.some((listing) => listing.id === id));
  save("thebellydancedressingroom-listings", state.listings);
  save("thebellydancedressingroom-saved", state.saved);
}

const screens = document.querySelectorAll(".screen");
const tabs = document.querySelectorAll(".tab");
const listingGrid = document.querySelector("#listing-grid");
const savedGrid = document.querySelector("#saved-grid");
const marketPagination = document.querySelector("#market-pagination");
const marketPrevPage = document.querySelector("#market-prev-page");
const marketNextPage = document.querySelector("#market-next-page");
const marketPageStatus = document.querySelector("#market-page-status");
const savedPagination = document.querySelector("#saved-pagination");
const savedPrevPage = document.querySelector("#saved-prev-page");
const savedNextPage = document.querySelector("#saved-next-page");
const savedPageStatus = document.querySelector("#saved-page-status");
const chatList = document.querySelector("#chat-list");
const conversationPanel = document.querySelector("#conversation-panel");
const conversationTitle = document.querySelector("#conversation-title");
const closeConversationButton = document.querySelector("#close-conversation");
const messageThread = document.querySelector("#message-thread");
const replyForm = document.querySelector("#reply-form");
const replyInput = document.querySelector("#reply-input");
const photoViewer = document.querySelector("#photo-viewer");
const photoViewerImage = document.querySelector("#photo-viewer-image");
const closePhotoViewerButton = document.querySelector("#close-photo-viewer");
const template = document.querySelector("#listing-template");
const searchInput = document.querySelector("#search-input");
const filterToggle = document.querySelector("#filter-toggle");
const filterPanel = document.querySelector("#filter-panel");
const styleFilter = document.querySelector("#style-filter");
const designerFilter = document.querySelector("#designer-filter");
const colorFilter = document.querySelector("#color-filter");
const sizeFilter = document.querySelector("#size-filter");
const locationFilter = document.querySelector("#location-filter");
const clearFiltersButton = document.querySelector("#clear-filters");
const sellForm = document.querySelector("#sell-form");
const photoInput = document.querySelector("#photo-input");
const photoEmpty = document.querySelector("#photo-empty");
const photoPreviewGrid = document.querySelector("#photo-preview-grid");
const backendStatus = document.querySelector("#backend-status");
const accountMessage = document.querySelector("#account-message");
const profileForm = document.querySelector("#profile-form");
const displayNameInput = document.querySelector("#display-name-input");
const feedbackForm = document.querySelector("#feedback-form");
const feedbackNote = document.querySelector("#feedback-note");
const googleSignInButton = document.querySelector("#google-sign-in-button");
const signOutButton = document.querySelector("#sign-out-button");
const inboxBadge = document.querySelector("#inbox-badge");
const sellNote = document.querySelector("#sell-note");
const publishButton = document.querySelector("#publish-button");
const cancelEditButton = document.querySelector("#cancel-edit-button");
const sellTab = document.querySelector('[data-tab="sell-screen"]');
const openSellButton = document.querySelector("[data-open-sell]");
let selectedFiles = [];
let selectedPhotos = [];
let editingListingId = null;
let editingListingOwnerId = null;
const maxListingPhotoBytes = 5 * 1024 * 1024;
const listingsPerPage = 6;
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeListing(listing) {
  return {
    id: listing.id,
    ownerId: listing.owner_id || listing.ownerId || null,
    name: listing.name,
    price: Number(listing.price || 0),
    size: listing.size,
    style: listing.style || "",
    designer: listing.designer || "",
    color: listing.color || "",
    location: listing.location || "",
    condition: listing.condition,
    ship: Boolean(listing.ship),
    status: listing.status || "active",
    sellerName: listing.seller_name || listing.sellerName || "Seller",
    details: listing.details || "Seller will confirm measurements before shipping.",
    paymentOptions: listing.payment_options || listing.paymentOptions || {},
    images: Array.isArray(listing.image_urls)
      ? listing.image_urls
      : Array.isArray(listing.images)
        ? listing.images
        : [listing.image].filter(Boolean),
    position: listing.position || "center"
  };
}

function updateAccountUi() {
  if (!hasSupabaseConfig) {
    backendStatus.textContent = "Local preview";
    accountMessage.textContent = "Connect Supabase to enable real sign-up, shared listings, and cloud photo uploads.";
    googleSignInButton.disabled = true;
    profileForm.hidden = true;
    signOutButton.hidden = true;
    openSellButton.hidden = true;
    sellTab.disabled = true;
    publishButton.disabled = true;
    sellNote.textContent = "Local preview mode is active. Connect Supabase before inviting real sellers.";
    return;
  }

  backendStatus.textContent = state.session ? "Signed in" : "Supabase ready";
  accountMessage.textContent = state.session
    ? `Signed in as ${state.session.user.email}. Listings will show as ${getSellerName()}.${state.isAdmin ? " Admin mode is enabled." : ""}`
    : "Continue with Google before publishing a live listing.";
  googleSignInButton.disabled = Boolean(state.session);
  profileForm.hidden = !state.session;
  signOutButton.hidden = !state.session;
  openSellButton.hidden = !state.session;
  sellTab.disabled = !state.session;
  publishButton.disabled = !state.session;
  if (!state.session && document.querySelector("#sell-screen").classList.contains("active")) {
    showScreen("market-screen");
  }
  sellNote.textContent = state.session
    ? "You are signed in. Your listing photos will upload to Supabase Storage."
    : "Sign in before publishing a live listing.";
}

function getSellerName() {
  return state.profile?.display_name || state.session?.user?.user_metadata?.full_name || state.session?.user?.email || "Seller";
}

function showScreen(id) {
  if (id === "sell-screen" && !state.session) {
    accountMessage.textContent = "Please sign in with Google before posting a dress.";
    id = "market-screen";
  }

  screens.forEach((screen) => {
    const isActive = screen.id === id;
    screen.classList.toggle("active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === id;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-current", isActive ? "page" : "false");
  });
  if (id === "saved-screen") renderSaved();
  if (id === "inbox-screen") loadInquiries();
}

function updateInboxBadge(count) {
  const safeCount = Math.max(0, Number(count || 0));
  inboxBadge.hidden = !state.session || safeCount === 0;
  inboxBadge.textContent = safeCount > 9 ? "9+" : String(safeCount);
  inboxBadge.setAttribute("aria-label", `${safeCount} buyer message${safeCount === 1 ? "" : "s"}`);
}

function activeListings() {
  return state.listings.filter((item) => {
    const haystack = `${item.name} ${item.size} ${item.style} ${item.designer} ${item.color} ${item.location} ${item.condition} ${item.details}`.toLowerCase();
    const matchesQuery = haystack.includes(state.query.toLowerCase());
    const matchesAdvanced =
      (!state.filters.style || item.style === state.filters.style) &&
      (!state.filters.designer || item.designer === state.filters.designer) &&
      (!state.filters.color || item.color === state.filters.color) &&
      (!state.filters.size || item.size === state.filters.size) &&
      (!state.filters.location || item.location === state.filters.location);
    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "ready" && item.ship) ||
      (state.filter === "under300" && item.price < 300) ||
      (state.filter === "plus" && ["XL", "2X+"].includes(item.size));
    return matchesQuery && matchesAdvanced && matchesFilter;
  });
}

function renderListings() {
  listingGrid.innerHTML = "";
  const items = activeListings();
  const page = normalizePage(state.marketPage, items.length);
  const pagedItems = paginate(items, page);
  state.marketPage = page;

  if (!items.length) {
    listingGrid.append(emptyState("No real listings yet."));
    updatePagination(marketPagination, marketPrevPage, marketNextPage, marketPageStatus, 1, 1);
    return;
  }

  pagedItems.forEach((item) => listingGrid.append(createListingCard(item)));
  updatePagination(marketPagination, marketPrevPage, marketNextPage, marketPageStatus, page, pageCount(items.length));
}

function renderSaved() {
  savedGrid.innerHTML = "";
  const savedIds = state.saved.map(String);
  const items = state.listings.filter((item) => savedIds.includes(String(item.id)));
  const page = normalizePage(state.savedPage, items.length);
  const pagedItems = paginate(items, page);
  state.savedPage = page;

  if (!items.length) {
    savedGrid.append(emptyState("Saved dresses will appear here."));
    updatePagination(savedPagination, savedPrevPage, savedNextPage, savedPageStatus, 1, 1);
    return;
  }

  pagedItems.forEach((item) => savedGrid.append(createListingCard(item)));
  updatePagination(savedPagination, savedPrevPage, savedNextPage, savedPageStatus, page, pageCount(items.length));
}

function pageCount(itemCount) {
  return Math.max(1, Math.ceil(itemCount / listingsPerPage));
}

function normalizePage(page, itemCount) {
  return Math.min(Math.max(1, Number(page || 1)), pageCount(itemCount));
}

function paginate(items, page) {
  const start = (page - 1) * listingsPerPage;
  return items.slice(start, start + listingsPerPage);
}

function updatePagination(container, previousButton, nextButton, status, page, totalPages) {
  container.hidden = totalPages <= 1;
  previousButton.disabled = page <= 1;
  nextButton.disabled = page >= totalPages;
  status.textContent = `Page ${page} of ${totalPages}`;
}

function renderChats() {
  chatList.innerHTML = "";
  if (!state.chats.length) {
    chatList.append(emptyState("No buyer chats yet."));
    conversationPanel.hidden = true;
    return;
  }

  state.chats.forEach((chat) => {
    const item = document.createElement("button");
    item.type = "button";
    const needsReply = chat.status === "new" && chat.sellerId === state.session?.user?.id;
    item.className = `chat-item ${needsReply ? "unanswered" : ""}`;
    item.setAttribute("aria-label", `${needsReply ? "Needs reply" : "Conversation"} with ${chat.name}: ${chat.message}`);
    const avatar = document.createElement("span");
    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const message = document.createElement("p");
    const status = document.createElement("span");

    avatar.className = "avatar";
    avatar.textContent = chat.name.slice(0, 1).toUpperCase();
    name.textContent = chat.name;
    message.textContent = chat.message;
    status.className = "chat-status";
    status.textContent = needsReply ? "Needs reply" : "Open conversation";
    copy.append(name, message, status);
    item.append(avatar, copy);
    item.addEventListener("click", () => openConversation(chat));
    chatList.append(item);
  });
}

function createListingCard(item) {
  const node = template.content.firstElementChild.cloneNode(true);
  const image = node.querySelector(".listing-image");
  const saveButton = node.querySelector(".save-button");
  const messageButton = node.querySelector(".message-button");
  const previousButton = node.querySelector(".gallery-button.previous");
  const nextButton = node.querySelector(".gallery-button.next");
  const zoomButton = node.querySelector(".zoom-button");
  const photoCount = node.querySelector(".photo-count");
  const ownerActions = node.querySelector(".owner-actions");
  const reportButton = node.querySelector(".report-button");
  const paymentOptions = node.querySelector(".payment-options");
  const paymentList = paymentOptions.querySelector("ul");
  const images = item.images || [];
  const canManage = canManageListing(item);
  let photoIndex = 0;

  image.alt = item.name;
  image.style.objectPosition = item.position || "center";
  node.querySelector("h3").textContent = item.name;
  node.querySelector("strong").textContent = usdFormatter.format(item.price);
  node.querySelector(".listing-meta").textContent = listingMeta(item);
  node.querySelector(".seller-name").textContent = `Seller: ${item.sellerName}`;
  node.querySelector(".listing-details").textContent = item.details;
  renderPaymentOptions(item.paymentOptions, paymentOptions, paymentList);

  const isSaved = state.saved.map(String).includes(String(item.id));
  saveButton.classList.toggle("saved", isSaved);
  saveButton.setAttribute("aria-pressed", String(isSaved));
  saveButton.textContent = isSaved ? "♥ Saved" : "♡ Save";
  saveButton.addEventListener("click", () => toggleSaved(item.id));
  messageButton.addEventListener("click", () => startChat(item));
  messageButton.hidden = canManage;
  messageButton.disabled = item.status === "sold";
  messageButton.textContent = item.status === "sold" ? "Sold" : "Message seller";
  ownerActions.hidden = !canManage;
  reportButton.hidden = canManage;
  ownerActions.querySelector('[data-action="edit"]').addEventListener("click", () => startEditListing(item));
  ownerActions.querySelector('[data-action="sold"]').addEventListener("click", () => markListingSold(item));
  ownerActions.querySelector('[data-action="delete"]').addEventListener("click", () => deleteListing(item));
  reportButton.addEventListener("click", () => reportListing(item));

  function renderPhoto() {
    image.src = images[photoIndex];
    photoCount.textContent = `${photoIndex + 1}/${images.length}`;
    previousButton.hidden = images.length < 2;
    nextButton.hidden = images.length < 2;
    photoCount.hidden = images.length < 2;
  }

  previousButton.addEventListener("click", () => {
    photoIndex = (photoIndex - 1 + images.length) % images.length;
    renderPhoto();
  });

  nextButton.addEventListener("click", () => {
    photoIndex = (photoIndex + 1) % images.length;
    renderPhoto();
  });

  image.addEventListener("click", () => openPhotoViewer(item, images[photoIndex], photoIndex));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPhotoViewer(item, images[photoIndex], photoIndex);
    }
  });
  image.tabIndex = 0;
  zoomButton.addEventListener("click", () => openPhotoViewer(item, images[photoIndex], photoIndex));

  renderPhoto();
  return node;
}

function openPhotoViewer(item, src, index) {
  if (!src) return;

  photoViewerImage.src = src;
  photoViewerImage.alt = `${item.name} photo ${index + 1}`;
  photoViewer.hidden = false;
  closePhotoViewerButton.focus();
}

function closePhotoViewer() {
  photoViewer.hidden = true;
  photoViewerImage.removeAttribute("src");
}

function canManageListing(item) {
  return Boolean(
    state.session &&
    (state.isAdmin || String(item.ownerId) === String(state.session.user.id))
  );
}

function listingMeta(item) {
  return [
    item.size,
    item.style,
    item.designer,
    item.color,
    item.location,
    item.condition,
    item.ship ? "Ready to ship" : "Local pickup",
    item.status === "sold" ? "Sold" : ""
  ].filter(Boolean).join(" - ");
}

function renderPaymentOptions(options, container, list) {
  const labels = {
    paypal: "PayPal.me",
    venmo: "Venmo",
    cashapp: "Cash App",
    zelle: "Zelle",
    paymentNote: "Other"
  };
  const entries = Object.entries(options || {}).filter(([, value]) => String(value || "").trim());
  container.hidden = !entries.length;
  list.innerHTML = "";

  entries.forEach(([key, value]) => {
    const item = document.createElement("li");
    const label = labels[key] || key;
    item.textContent = `${label}: ${value}`;
    list.append(item);
  });
}

function emptyState(message) {
  const node = document.createElement("article");
  const title = document.createElement("strong");
  const copy = document.createElement("p");

  node.className = "empty-state";
  title.textContent = message;
  copy.textContent = "Seed the beta with 5 to 10 real dress listings from trusted testers before sharing widely.";
  node.append(title, copy);
  return node;
}

function toggleSaved(id) {
  const idValue = String(id);
  const savedIds = state.saved.map(String);
  const wasSaved = savedIds.includes(idValue);
  state.saved = wasSaved
    ? state.saved.filter((itemId) => String(itemId) !== idValue)
    : [...state.saved, idValue];
  save("thebellydancedressingroom-saved", state.saved);
  accountMessage.textContent = wasSaved
    ? "Removed from Wishlist."
    : "Saved to Wishlist. Open the Saved tab to see it.";
  renderListings();
  renderSaved();
}

async function startChat(item) {
  if (!state.session || !supabaseClient) {
    accountMessage.textContent = "Please sign in before messaging a seller.";
    return;
  }

  if (item.ownerId === state.session.user.id) {
    accountMessage.textContent = "This is your listing.";
    return;
  }

  const message = window.prompt(`Message ${item.sellerName} about "${item.name}"`, `Hi, is ${item.name} still available?`);
  if (!message?.trim()) return;

  const { data, error } = await supabaseClient.from("listing_inquiries").insert({
    listing_id: item.id,
    seller_id: item.ownerId,
    buyer_id: state.session.user.id,
    buyer_email: state.session.user.email,
    message: message.trim()
  }).select().single();

  if (error) {
    accountMessage.textContent = error.message;
    return;
  }

  await supabaseClient.from("inquiry_messages").insert({
    inquiry_id: data.id,
    sender_id: state.session.user.id,
    body: message.trim()
  });
  accountMessage.textContent = "Message sent to the seller inbox.";
}

async function loadInquiries() {
  if (!supabaseClient || !state.session) {
    updateInboxBadge(0);
    renderChats();
    return;
  }

  const { data, error } = await supabaseClient
    .from("listing_inquiries")
    .select("*")
    .or(`seller_id.eq.${state.session.user.id},buyer_id.eq.${state.session.user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    chatList.innerHTML = "";
    chatList.append(emptyState(`Inbox could not load: ${error.message}`));
    return;
  }

  state.chats = (data || []).map((inquiry) => {
    const isSeller = inquiry.seller_id === state.session.user.id;
    return {
      id: inquiry.id,
      listingId: inquiry.listing_id,
      sellerId: inquiry.seller_id,
      buyerId: inquiry.buyer_id,
      name: isSeller ? inquiry.buyer_email || "Buyer" : "Seller",
      message: inquiry.message,
      status: inquiry.status || "new",
      createdAt: inquiry.created_at
    };
  });
  updateInboxBadge(state.chats.filter((chat) => chat.sellerId === state.session.user.id && chat.status === "new").length);
  renderChats();
}

async function openConversation(inquiry) {
  state.activeInquiry = inquiry;
  conversationPanel.hidden = false;
  conversationTitle.textContent = inquiry.name;
  await loadConversationMessages(inquiry);
  replyInput.focus();
}

async function loadConversationMessages(inquiry) {
  if (!supabaseClient || !state.session) return;

  const { data, error } = await supabaseClient
    .from("inquiry_messages")
    .select("*")
    .eq("inquiry_id", inquiry.id)
    .order("created_at", { ascending: true });

  if (error) {
    messageThread.innerHTML = "";
    messageThread.append(emptyState(`Conversation could not load: ${error.message}`));
    return;
  }

  state.inquiryMessages = data || [];
  renderConversation();
}

function renderConversation() {
  messageThread.innerHTML = "";
  if (!state.inquiryMessages.length && state.activeInquiry?.message) {
    state.inquiryMessages = [{
      id: state.activeInquiry.id,
      sender_id: state.activeInquiry.buyerId,
      body: state.activeInquiry.message,
      created_at: state.activeInquiry.createdAt
    }];
  }

  state.inquiryMessages.forEach((message) => {
    const bubble = document.createElement("article");
    const isMine = message.sender_id === state.session?.user?.id;
    const body = document.createElement("p");
    const timestamp = document.createElement("span");

    bubble.className = `message-bubble ${isMine ? "mine" : "theirs"}`;
    body.textContent = message.body;
    timestamp.textContent = new Date(message.created_at).toLocaleString();
    bubble.append(body, timestamp);
    messageThread.append(bubble);
  });
}

async function sendReply(event) {
  event.preventDefault();
  if (!supabaseClient || !state.session || !state.activeInquiry) return;

  const body = replyInput.value.trim();
  if (!body) return;

  const { data, error } = await supabaseClient
    .from("inquiry_messages")
    .insert({
      inquiry_id: state.activeInquiry.id,
      sender_id: state.session.user.id,
      body
    })
    .select()
    .single();

  if (error) {
    messageThread.append(emptyState(error.message));
    return;
  }

  replyInput.value = "";
  state.inquiryMessages = [...state.inquiryMessages, data];
  renderConversation();

  const nextStatus = state.activeInquiry.sellerId === state.session.user.id ? "read" : "new";
  await updateInquiryStatus(state.activeInquiry.id, nextStatus);
  await refreshInboxCount();
}

async function updateInquiryStatus(inquiryId, status) {
  if (!supabaseClient || !state.session) return;

  const { error } = await supabaseClient
    .from("listing_inquiries")
    .update({ status })
    .eq("id", inquiryId);

  if (error) {
    accountMessage.textContent = `Message sent, but inbox status could not update: ${error.message}`;
    return;
  }

  state.chats = state.chats.map((chat) => (
    chat.id === inquiryId ? { ...chat, status } : chat
  ));
  if (state.activeInquiry?.id === inquiryId) {
    state.activeInquiry = { ...state.activeInquiry, status };
  }
  renderChats();
}

async function refreshInboxCount() {
  if (!supabaseClient || !state.session) {
    updateInboxBadge(0);
    return;
  }

  const { count, error } = await supabaseClient
    .from("listing_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", state.session.user.id)
    .eq("status", "new");

  if (!error) {
    updateInboxBadge(count || 0);
  }
}

async function loadSupabaseListings() {
  if (!supabaseClient) {
    renderListings();
    return;
  }

  const { data, error } = await supabaseClient
    .from("listings")
    .select("*")
    .in("status", ["active", "sold"])
    .order("created_at", { ascending: false });

  if (error) {
    accountMessage.textContent = `Supabase is connected, but listings could not load: ${error.message}`;
    renderListings();
    return;
  }

  state.listings = (data || []).map(normalizeListing);
  renderListings();
}

async function loadProfile() {
  if (!supabaseClient || !state.session) {
    state.profile = null;
    displayNameInput.value = "";
    return;
  }

  const fallbackName = state.session.user.user_metadata?.full_name || state.session.user.email || "Seller";
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", state.session.user.id)
    .maybeSingle();

  if (error) {
    accountMessage.textContent = `Signed in, but profile could not load: ${error.message}`;
    return;
  }

  state.profile = data || {
    id: state.session.user.id,
    email: state.session.user.email,
    display_name: fallbackName
  };
  displayNameInput.value = state.profile.display_name || fallbackName;
  updateAccountUi();
}

async function loadAdminStatus() {
  state.isAdmin = false;

  if (!supabaseClient || !state.session) return;

  const { data, error } = await supabaseClient
    .from("app_admins")
    .select("user_id")
    .eq("user_id", state.session.user.id)
    .maybeSingle();

  state.isAdmin = Boolean(data && !error);
}

async function saveProfile(event) {
  event.preventDefault();
  if (!supabaseClient || !state.session) return;

  const displayName = displayNameInput.value.trim() || state.session.user.email;
  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert({
      id: state.session.user.id,
      email: state.session.user.email,
      display_name: displayName
    })
    .select()
    .single();

  if (error) {
    accountMessage.textContent = error.message;
    return;
  }

  state.profile = data;
  updateAccountUi();
  accountMessage.textContent = `Profile saved. Listings will show as ${getSellerName()}.`;
}

async function uploadListingPhotos(listingId) {
  if (!supabaseClient) {
    return [...selectedPhotos];
  }

  const urls = [];
  for (const [index, file] of selectedFiles.entries()) {
    if (!isValidListingPhoto(file)) {
      throw new Error("Listing photos must be image files under 5 MB each.");
    }

    const extension = file.name.split(".").pop() || "jpg";
    const path = `${state.session.user.id}/${listingId}/${index + 1}-${Date.now()}.${extension}`;
    const { error } = await supabaseClient.storage.from(listingBucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) throw error;

    const { data } = supabaseClient.storage.from(listingBucket).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

async function publishListing(listing) {
  if (!state.session) {
    throw new Error("Please sign in before publishing a listing.");
  }

  if (!supabaseClient) {
    state.listings = editingListingId
      ? state.listings.map((item) => item.id === editingListingId ? listing : item)
      : [listing, ...state.listings];
    save("thebellydancedressingroom-listings", state.listings);
    return;
  }

  const payload = {
    owner_id: editingListingId ? editingListingOwnerId : state.session.user.id,
    name: listing.name,
    price: listing.price,
    size: listing.size,
    style: listing.style,
    designer: listing.designer,
    color: listing.color,
    location: listing.location,
    condition: listing.condition,
    ship: listing.ship,
    seller_name: getSellerName(),
    details: listing.details,
    payment_options: listing.paymentOptions,
    image_urls: listing.images,
    status: "active"
  };

  const request = editingListingId
    ? supabaseClient.from("listings").update(payload).eq("id", editingListingId).select().single()
    : supabaseClient.from("listings").insert(payload).select().single();

  const { data, error } = await request;

  if (error) throw error;
  const savedListing = normalizeListing(data);
  state.listings = editingListingId
    ? state.listings.map((item) => item.id === editingListingId ? savedListing : item)
    : [savedListing, ...state.listings];
}

function startEditListing(item) {
  if (!canManageListing(item)) {
    accountMessage.textContent = "Only the seller who posted this listing or the app admin can edit it.";
    return;
  }

  editingListingId = item.id;
  editingListingOwnerId = item.ownerId;
  sellForm.elements.name.value = item.name;
  sellForm.elements.price.value = item.price;
  sellForm.elements.size.value = item.size;
  sellForm.elements.style.value = item.style;
  sellForm.elements.designer.value = item.designer || "";
  sellForm.elements.color.value = item.color;
  sellForm.elements.location.value = item.location;
  sellForm.elements.condition.value = item.condition;
  sellForm.elements.details.value = item.details;
  sellForm.elements.paypal.value = item.paymentOptions?.paypal || "";
  sellForm.elements.venmo.value = item.paymentOptions?.venmo || "";
  sellForm.elements.cashapp.value = item.paymentOptions?.cashapp || "";
  sellForm.elements.zelle.value = item.paymentOptions?.zelle || "";
  sellForm.elements.paymentNote.value = item.paymentOptions?.paymentNote || "";
  sellForm.elements.ship.checked = item.ship;
  selectedFiles = [];
  selectedPhotos = [...item.images];
  renderSelectedPhotoPreviews();
  photoEmpty.textContent = `${selectedPhotos.length} existing photo${selectedPhotos.length === 1 ? "" : "s"} attached`;
  publishButton.textContent = "Save changes";
  cancelEditButton.hidden = false;
  showScreen("sell-screen");
}

function cancelEdit() {
  editingListingId = null;
  editingListingOwnerId = null;
  sellForm.reset();
  selectedFiles = [];
  selectedPhotos = [];
  photoPreviewGrid.innerHTML = "";
  photoEmpty.textContent = "Add 1 to 5 actual listing photos";
  publishButton.textContent = "Publish listing";
  cancelEditButton.hidden = true;
}

async function markListingSold(item) {
  if (!supabaseClient || !state.session) return;
  if (!canManageListing(item)) {
    accountMessage.textContent = "Only the seller who posted this listing or the app admin can mark it as sold.";
    return;
  }
  if (!window.confirm(`Mark "${item.name}" as sold?`)) return;

  const { data, error } = await supabaseClient
    .from("listings")
    .update({ status: "sold" })
    .eq("id", item.id)
    .select()
    .single();

  if (error) {
    accountMessage.textContent = error.message;
    return;
  }

  state.listings = state.listings.map((listing) => listing.id === item.id ? normalizeListing(data) : listing);
  renderListings();
  renderSaved();
}

async function deleteListing(item) {
  if (!canManageListing(item)) {
    accountMessage.textContent = "Only the seller who posted this listing or the app admin can delete it.";
    return;
  }

  if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

  if (supabaseClient && state.session) {
    const { error } = await supabaseClient.from("listings").delete().eq("id", item.id);
    if (error) {
      accountMessage.textContent = error.message;
      return;
    }
  }

  state.listings = state.listings.filter((listing) => listing.id !== item.id);
  state.saved = state.saved.filter((id) => String(id) !== String(item.id));
  save("thebellydancedressingroom-listings", state.listings);
  save("thebellydancedressingroom-saved", state.saved);
  renderListings();
  renderSaved();
}

async function reportListing(item) {
  if (!supabaseClient || !state.session) {
    accountMessage.textContent = "Please sign in before reporting a listing.";
    return;
  }

  const reason = window.prompt("Why are you reporting this listing?");
  if (!reason?.trim()) return;

  const { error } = await supabaseClient.from("listing_reports").insert({
    listing_id: item.id,
    reporter_id: state.session.user.id,
    reason: reason.trim()
  });

  accountMessage.textContent = error ? error.message : "Thanks. The report was saved for review.";
}

async function submitFeedback(event) {
  event.preventDefault();
  const form = new FormData(feedbackForm);
  const message = String(form.get("feedback")).trim();

  if (!message) {
    feedbackNote.textContent = "Add a feedback note before sending.";
    return;
  }

  if (!supabaseClient) {
    feedbackNote.textContent = "Feedback needs Supabase to be connected.";
    return;
  }

  const { error } = await supabaseClient.from("beta_feedback").insert({
    user_id: state.session?.user?.id || null,
    contact_email: state.session?.user?.email || null,
    message
  });

  if (error) {
    feedbackNote.textContent = error.message;
    return;
  }

  feedbackForm.reset();
  feedbackNote.textContent = "Thank you. Your feedback was saved.";
}

async function signInWithGoogle() {
  if (!supabaseClient) return;

  const result = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });

  if (result.error) {
    accountMessage.textContent = result.error.message;
  }
}

tabs.forEach((tab) => tab.addEventListener("click", () => showScreen(tab.dataset.tab)));
openSellButton.addEventListener("click", () => showScreen("sell-screen"));
document.querySelector("[data-open-market]").addEventListener("click", () => showScreen("market-screen"));
googleSignInButton.addEventListener("click", signInWithGoogle);
signOutButton.addEventListener("click", async () => {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  updateInboxBadge(0);
});
profileForm.addEventListener("submit", saveProfile);
feedbackForm.addEventListener("submit", submitFeedback);
cancelEditButton.addEventListener("click", cancelEdit);
replyForm.addEventListener("submit", sendReply);
closeConversationButton.addEventListener("click", () => {
  conversationPanel.hidden = true;
  state.activeInquiry = null;
  state.inquiryMessages = [];
});
closePhotoViewerButton.addEventListener("click", closePhotoViewer);
photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) closePhotoViewer();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !photoViewer.hidden) closePhotoViewer();
});
filterToggle.addEventListener("click", () => {
  filterPanel.hidden = !filterPanel.hidden;
  filterToggle.setAttribute("aria-expanded", String(!filterPanel.hidden));
});
clearFiltersButton.addEventListener("click", () => {
  styleFilter.value = "";
  designerFilter.value = "";
  colorFilter.value = "";
  sizeFilter.value = "";
  locationFilter.value = "";
  state.filters = { style: "", designer: "", color: "", size: "", location: "" };
  state.marketPage = 1;
  renderListings();
});

[styleFilter, designerFilter, colorFilter, sizeFilter, locationFilter].forEach((input) => {
  input.addEventListener("input", () => {
    state.filters = {
      style: styleFilter.value,
      designer: designerFilter.value,
      color: colorFilter.value,
      size: sizeFilter.value,
      location: locationFilter.value
    };
    state.marketPage = 1;
    renderListings();
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    state.filter = chip.dataset.filter;
    state.marketPage = 1;
    renderListings();
  });
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  state.marketPage = 1;
  renderListings();
});

marketPrevPage.addEventListener("click", () => {
  state.marketPage -= 1;
  renderListings();
});

marketNextPage.addEventListener("click", () => {
  state.marketPage += 1;
  renderListings();
});

savedPrevPage.addEventListener("click", () => {
  state.savedPage -= 1;
  renderSaved();
});

savedNextPage.addEventListener("click", () => {
  state.savedPage += 1;
  renderSaved();
});

photoInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []).slice(0, 5);
  const invalidFile = files.find((file) => !isValidListingPhoto(file));

  if (invalidFile) {
    selectedFiles = [];
    selectedPhotos = [];
    photoInput.value = "";
    photoPreviewGrid.innerHTML = "";
    photoEmpty.textContent = "Only image files under 5 MB each can be uploaded.";
    return;
  }

  selectedFiles = files;
  selectedPhotos = [];
  photoPreviewGrid.innerHTML = "";
  photoEmpty.textContent = files.length ? `${files.length} photo${files.length === 1 ? "" : "s"} selected` : "Add 1 to 5 actual listing photos";

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      selectedPhotos[index] = reader.result;
      renderSelectedPhotoPreviews();
    });
    reader.readAsDataURL(file);
  });
});

function isValidListingPhoto(file) {
  return Boolean(file && file.type.startsWith("image/") && file.size <= maxListingPhotoBytes);
}

function renderSelectedPhotoPreviews() {
  photoPreviewGrid.innerHTML = "";
  selectedPhotos.filter(Boolean).forEach((photo, index) => {
    const image = document.createElement("img");
    image.src = photo;
    image.alt = `Selected listing photo ${index + 1}`;
    photoPreviewGrid.append(image);
  });
}

sellForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.session) {
    sellNote.textContent = "Please sign in with Google before publishing a listing.";
    showScreen("market-screen");
    return;
  }

  selectedPhotos = selectedPhotos.filter(Boolean).slice(0, 5);
  selectedFiles = selectedFiles.slice(0, 5);
  if (!selectedPhotos.length) {
    photoEmpty.textContent = "Add at least 1 actual listing photo";
    return;
  }

  try {
    const form = new FormData(sellForm);
    const id = `listing-${Date.now()}`;
    const imageUrls = selectedFiles.length ? await uploadListingPhotos(id) : [...selectedPhotos];
    const listing = {
      id,
      ownerId: editingListingId ? editingListingOwnerId : state.session.user.id,
      name: String(form.get("name")).trim(),
      price: Number(String(form.get("price")).replace(/[^\d]/g, "")),
      size: String(form.get("size")),
      style: String(form.get("style")).trim(),
      designer: String(form.get("designer")).trim(),
      color: String(form.get("color")).trim(),
      location: String(form.get("location")).trim(),
      condition: String(form.get("condition")),
      ship: form.get("ship") === "on",
      details: String(form.get("details")).trim() || "Seller will confirm measurements before shipping.",
      paymentOptions: {
        paypal: String(form.get("paypal")).trim(),
        venmo: String(form.get("venmo")).trim(),
        cashapp: String(form.get("cashapp")).trim(),
        zelle: String(form.get("zelle")).trim(),
        paymentNote: String(form.get("paymentNote")).trim()
      },
      images: imageUrls,
      sellerName: getSellerName(),
      status: "active",
      position: "center"
    };

    await publishListing(listing);
    cancelEdit();
    showScreen("market-screen");
    renderListings();
  } catch (error) {
    sellNote.textContent = error.message;
  }
});

async function init() {
  if (supabaseClient) {
    const { data } = await supabaseClient.auth.getSession();
    state.session = data.session;
    await loadProfile();
    await loadAdminStatus();
    await refreshInboxCount();
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      state.session = session;
      await loadProfile();
      await loadAdminStatus();
      updateAccountUi();
      renderListings();
      renderSaved();
      refreshInboxCount();
    });
  }

  updateAccountUi();
  await loadSupabaseListings();
}

init();
