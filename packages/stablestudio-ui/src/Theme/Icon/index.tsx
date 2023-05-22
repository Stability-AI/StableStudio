import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftCircle,
  Brush,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  ChevronsLeftRight,
  ChevronUp,
  Clapperboard,
  Coins,
  Copy,
  Dices,
  Download,
  Edit,
  Eraser,
  ExternalLink,
  Eye,
  EyeOff,
  Focus,
  Folders,
  Hand,
  History,
  Image,
  ImagePlus,
  Import,
  Info,
  Keyboard,
  Layers,
  Locate,
  LocateFixed,
  Lock,
  LucideProps,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Palette,
  Pencil,
  Plus,
  Redo,
  RefreshCw as RefreshClockwise,
  Search,
  MousePointer2 as Select,
  Settings,
  Sidebar,
  SidebarClose,
  SidebarOpen,
  Slash,
  Sliders,
  Sprout,
  Star,
  TimerReset,
  Trash,
  Undo,
  Unlock,
  Upload,
  Users,
  Wand2 as Wand,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  ArtStation,
  AspectRatio,
  CGSociety,
  Discord,
  Dream,
  Generate,
  InfoIcon,
  Instagram,
  ModelIcon,
  Rectangle,
  Scale,
  ShareIcon,
  SlidersIcon,
  Steps,
  Twitter,
  Upscale,
  Variation,
  Light,
  Dark
} from "./SVGs";

export declare namespace Icon {
  export {
    AlertCircle,
    AlertTriangle,
    Brush,
    Camera,
    Image,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clapperboard,
    Users,
    ChevronsDownUp,
    Copy,
    Dices,
    Download,
    Eye,
    Edit,
    EyeOff,
    ExternalLink,
    Hand,
    History,
    Import,
    Info,
    Layers,
    Locate,
    Undo,
    Redo,
    LocateFixed,
    Minus,
    MoreVertical,
    MoreHorizontal,
    Slash,
    Plus,
    Select,
    Sidebar,
    SidebarOpen,
    SidebarClose,
    Search,
    Settings,
    Sliders,
    Trash,
    Wand,
    Upload,
    Wrench,
    X,
    RefreshClockwise,
    ArtStation,
    Instagram,
    Twitter,
    Discord,
    CGSociety,
    InfoIcon,
    ShareIcon,
    AspectRatio,
    ModelIcon,
    SlidersIcon,
    Sprout,
    Star,
    TimerReset,
    ZoomIn,
    ZoomOut,
    Focus,
    Palette,
    Steps,
    Generate,
    Scale,
    Folders,
    Coins,
    Eraser,
    Lock,
    Unlock,
    Rectangle,
    ArrowLeftCircle,
    ImagePlus,
    Variation,
    Pencil,
    Dream,
    Upscale,
    Keyboard,
    ChevronsLeftRight,
    Light,
    Dark,
  };
}

export namespace Icon {
  export type Prop = React.ReactNode | React.FunctionComponent<Props>;
  export type Props = LucideProps;

  function makeComponent(Icon: (props: Props) => JSX.Element) {
    return (props: Props) => <Icon {...props} strokeWidth={1.5} />;
  }

  Icon.AlertCircle = makeComponent(AlertCircle);
  Icon.AlertTriangle = makeComponent(AlertTriangle);
  Icon.Brush = makeComponent(Brush);
  Icon.Camera = makeComponent(Camera);
  Icon.Check = makeComponent(Check);
  Icon.ChevronDown = makeComponent(ChevronDown);
  Icon.ChevronUp = makeComponent(ChevronUp);
  Icon.ChevronsDownUp = makeComponent(ChevronsDownUp);
  Icon.ChevronLeft = makeComponent(ChevronLeft);
  Icon.Users = makeComponent(Users);
  Icon.Clapperboard = makeComponent(Clapperboard);
  Icon.ChevronRight = makeComponent(ChevronRight);
  Icon.Copy = makeComponent(Copy);
  Icon.Dices = makeComponent(Dices);
  Icon.Download = makeComponent(Download);
  Icon.Image = makeComponent(Image);
  Icon.Eye = makeComponent(Eye);
  Icon.Folders = makeComponent(Folders);
  Icon.Download = makeComponent(Download);
  Icon.EyeOff = makeComponent(EyeOff);
  Icon.Edit = makeComponent(Edit);
  Icon.ExternalLink = makeComponent(ExternalLink);
  Icon.Slash = makeComponent(Slash);
  Icon.Hand = makeComponent(Hand);
  Icon.History = makeComponent(History);
  Icon.Import = makeComponent(Import);
  Icon.Info = makeComponent(Info);
  Icon.Layers = makeComponent(Layers);
  Icon.Palette = makeComponent(Palette);
  Icon.Locate = makeComponent(Locate);
  Icon.LocateFixed = makeComponent(LocateFixed);
  Icon.Minus = makeComponent(Minus);
  Icon.MoreVertical = makeComponent(MoreVertical);
  Icon.MoreHorizontal = makeComponent(MoreHorizontal);
  Icon.Plus = makeComponent(Plus);
  Icon.Select = makeComponent(Select);
  Icon.Settings = makeComponent(Settings);
  Icon.Sliders = makeComponent(Sliders);
  Icon.Trash = makeComponent(Trash);
  Icon.Wand = makeComponent(Wand);
  Icon.Undo = makeComponent(Undo);
  Icon.Redo = makeComponent(Redo);
  Icon.Upload = makeComponent(Upload);
  Icon.Wrench = makeComponent(Wrench);
  Icon.X = makeComponent(X);
  Icon.ArtStation = makeComponent(ArtStation);
  Icon.Instagram = makeComponent(Instagram);
  Icon.Twitter = makeComponent(Twitter);
  Icon.Discord = makeComponent(Discord);
  Icon.Generate = makeComponent(Generate);
  Icon.CGSociety = makeComponent(CGSociety);
  Icon.RefreshClockwise = makeComponent(RefreshClockwise);
  Icon.InfoIcon = makeComponent(InfoIcon);
  Icon.ShareIcon = makeComponent(ShareIcon);
  Icon.Search = makeComponent(Search);
  Icon.AspectRatio = makeComponent(AspectRatio);
  Icon.ModelIcon = makeComponent(ModelIcon);
  Icon.SlidersIcon = makeComponent(SlidersIcon);
  Icon.Sprout = makeComponent(Sprout);
  Icon.Star = makeComponent(Star);
  Icon.TimerReset = makeComponent(TimerReset);
  Icon.ZoomIn = makeComponent(ZoomIn);
  Icon.ZoomOut = makeComponent(ZoomOut);
  Icon.Focus = makeComponent(Focus);
  Icon.Sidebar = makeComponent(Sidebar);
  Icon.SidebarOpen = makeComponent(SidebarOpen);
  Icon.SidebarClose = makeComponent(SidebarClose);
  Icon.Steps = makeComponent(Steps);
  Icon.Scale = makeComponent(Scale);
  Icon.Coins = makeComponent(Coins);
  Icon.Eraser = makeComponent(Eraser);
  Icon.Lock = makeComponent(Lock);
  Icon.Unlock = makeComponent(Unlock);
  Icon.Rectangle = makeComponent(Rectangle);
  Icon.ArrowLeftCircle = makeComponent(ArrowLeftCircle);
  Icon.ImagePlus = makeComponent(ImagePlus);
  Icon.Variation = makeComponent(Variation);
  Icon.Pencil = makeComponent(Pencil);
  Icon.Dream = makeComponent(Dream);
  Icon.Upscale = makeComponent(Upscale);
  Icon.Keyboard = makeComponent(Keyboard);
  Icon.ChevronsLeftRight = makeComponent(ChevronsLeftRight);
  Icon.Light = makeComponent(Light);
  Icon.Dark = makeComponent(Dark);

  export function Invisible(props: Props) {
    return (
      <Icon.Check
        {...props}
        css={css`
          & {
            opacity: 0;
          }
        `}
      />
    );
  }
}
