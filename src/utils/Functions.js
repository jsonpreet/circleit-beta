import { Link } from "react-router-dom";

export function timeStampToTimeAgo(p_timeStampNanoSeconds) {
  const milliseconds = p_timeStampNanoSeconds / 1000000;
  const durationUntilNowInMilliseconds = new Date().getTime() - milliseconds;
  const durationInMinutes = durationUntilNowInMilliseconds / 1000 / 60;

  if (durationInMinutes < 60) {
    return durationInMinutes > 1
      ? Math.floor(durationInMinutes) + " minutes ago"
      : Math.floor(durationInMinutes) + " minute ago";
  }

  const durationInHours = durationInMinutes / 60;

  if (durationInHours < 24) {
    return durationInHours > 1
      ? Math.floor(durationInHours) + " hours ago"
      : Math.floor(durationInHours) + " hour ago";
  }

  const durationInDays = durationInHours / 24;

  return durationInDays > 1
    ? Math.floor(durationInDays) + " days ago"
    : Math.floor(durationInDays) + " day ago";
}

export const LinkifyRenderLink = ({ attributes, content }) => {
  const { href, ...props } = attributes;
  return (
    <Link to={href} className='brandGradientText' {...props}>
      {content}
    </Link>
  );
};

export const LinkifyOptions = {
  formatHref: {
    //hashtag: (href) => "/hashtag/" + href.substr(1).toLowerCase(),
    mention: (href) => "/circle/" + href.substr(1).toLowerCase(),
  },
  render: {
    mention: LinkifyRenderLink,
    //hashtag: LinkifyRenderLink,
    url: ({ attributes, content }) => {
      return (
        <a {...attributes} className='brandGradientText' target='_blank'>
          {content}
        </a>
      );
    },
  },
  nl2br: true,
};

export const dateFormat = (p_timeStampNanoSeconds) => {
  const milliseconds = p_timeStampNanoSeconds / 1000000;
  const date = new Date(milliseconds);
  const formattedDate =
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return formattedDate;
};

export const toastOptions = {
  error: {
    style: {
      border: "1px solid rgba(223, 0, 141, 1)",
      padding: "16px",
      background:
        "linear-gradient(333deg, rgba(124, 0, 214, 0.9), rgba(223, 0, 141, 0.88))",
      borderRadius: "100px",
      boxShadow: "rgba(0, 0, 0, 0.35) 0px 6px 45px",
      backdropFilter: "blur(3px)",
      color: "#ffffff",
      whiteSpace: "nowrap",
      textShadow: "rgba(17, 17, 17, 0.21) 0px 1px 12px",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "rgba(223, 0, 141, 0.88)",
    },
  },
  success: {
    style: {
      border: "1px solid rgb(62, 148, 95)",
      padding: "16px",
      background:
        "linear-gradient(333deg, rgba(6, 176, 63, 0.88), rgba(0, 165, 142, 0.9))",
      borderRadius: "100px",
      boxShadow: "rgba(0, 0, 0, 0.35) 0px 6px 45px",
      backdropFilter: "blur(3px)",
      color: "rgb(255, 255, 255)",
      whiteSpace: "nowrap",
      textShadow: "rgba(17, 17, 17, 0.21) 0px 1px 12px",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "rgba(6, 176, 63, 0.88)",
    },
  },
  loading: {
    style: {
      border: "1px solid rgba(230, 125, 0, 0.88)",
      padding: "16px",
      background:
        "linear-gradient(333deg, rgba(230, 125, 0, 0.88), rgba(244, 160, 0, 0.9))",
      borderRadius: "100px",
      boxShadow: "rgba(0, 0, 0, 0.35) 0px 6px 45px",
      backdropFilter: "blur(3px)",
      color: "#ffffff",
      whiteSpace: "nowrap",
      textShadow: "rgba(17, 17, 17, 0.21) 0px 1px 12px",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "rgba(230, 125, 0, 1)",
    },
  },
  position: "top-center",
  reverseOrder: false,
  duration: 4000,
};

export const selectFile = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  const waitForSelection = new Promise((resolve, reject) => {
    input.onchange = () => {
      input && input.files && input.files[0]
        ? resolve(input.files[0])
        : reject(new Error("No File selected"));
    };
  });
  return waitForSelection;
};

export const getIsCircle = (circle) => {
  const payload = circle.ExtraData?.CircleIt
    ? JSON.parse(circle.ExtraData.CircleIt)
    : null;
  const isCircle =
    payload !== null && payload.isCircle === "true" ? true : false;
  return isCircle;
};

export function abbreviateNumber(value, decimals, toUSD) {
  let shortValue;
  const suffixes = ["", "K", "M", "B", "T"];
  const suffixNum = Math.floor((("" + value.toFixed(0)).length - 1) / 3);
  if (suffixNum === 0) {
    // if the number is less than 1000, we should only show at most 2 decimals places
    decimals = Math.min(2, decimals);
  }
  shortValue = (value / Math.pow(1000, suffixNum)).toFixed(decimals);
  if (toUSD) {
    shortValue = formatUSD(shortValue, decimals);
  }
  return shortValue + suffixes[suffixNum];
}

export function nanosToUSDNumber(nanos) {
  return nanos / 1e9;
}

export function formatUSD(num, decimal) {
  let formatUSDMemo;

  formatUSDMemo = Number(num).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  });
  return formatUSDMemo;
}

export const formatNumber = (num) => {
  if (num > 999 && num < 1000000) {
    return `${(num / 1000).toPrecision(3)}k`;
  } else if (num > 1000000) {
    return `${(num / 1000000).toPrecision(3)}m`;
  } else if (num < 1000) {
    return num;
  }
};

export const truncate = (str, max, suffix = "...") =>
  str.length < max
    ? str
    : `${str.substring(
        0,
        str.substring(0, max - suffix.length).lastIndexOf(" ")
      )}${suffix}`;

export const getBase64FromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const getAttachmentsClass = (attachments, isNew = false) => {
  if (attachments === 1) {
    return {
      aspect: isNew ? 'aspect-w-16 aspect-h-10' : '',
      row: 'grid-cols-1 grid-rows-1'
    };
  } else if (attachments === 2) {
    return {
      aspect: 'aspect-w-16 aspect-h-12',
      row: 'grid-cols-2 grid-rows-1'
    };
  } else if (attachments > 2) {
    return {
      aspect: 'aspect-w-16 aspect-h-12',
      row: 'grid-cols-2 grid-rows-2'
    };
  }
};