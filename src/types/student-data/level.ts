export interface Level {
    _id: string;
    name: string;
  }
  
  export interface LevelData {
    id: string;
    name: string;
  }
  
  export interface AddLevelReqBody {
    name: string;
  }
  
  export interface GetLevelsResBody {
    msg: string;
    levelCount: number;
    data: { id: string; name: string }[];
  }
  