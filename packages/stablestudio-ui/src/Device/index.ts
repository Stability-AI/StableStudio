export namespace Device {
  // TODO: Stop using `appVersion`
  export const getInfo = () => {
    const { userAgent } = navigator;
    const appVersion = navigator.appVersion;

    const deviceType =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
        ? "Mobile/Phone"
        : /iPad/i.test(userAgent)
        ? "Tablet"
        : "Desktop/Laptop";

    const browserName =
      userAgent.indexOf("Chrome") > -1 &&
      navigator.userAgent.indexOf("OPR") === -1
        ? "Chrome"
        : userAgent.indexOf("Firefox") > -1
        ? "Firefox"
        : userAgent.indexOf("Safari") > -1 && userAgent.indexOf("OPR") === -1
        ? "Safari"
        : userAgent.indexOf("Edge") > -1 || userAgent.indexOf("edg/") > -1
        ? "Edge"
        : userAgent.indexOf("OPR") > -1
        ? "Opera"
        : "Unknown";

    const operatingSystem = appVersion.match(/win/i)
      ? "Windows"
      : appVersion.match(/mac/i)
      ? "Mac"
      : appVersion.match(/linux/i)
      ? "Linux"
      : "Unknown";

    return { deviceType, browserName, operatingSystem };
  };
}
