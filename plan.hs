-- | any kind of path string, relative or absolute or chunk
type Path :: String

-- | Nat is a natural number including 0
type Top :: Nat
type Left :: Nat
type Right :: Nat
type Bot :: Nat

-- | either null or an array of natural numbers
type Edges :: null || [Top, Left, Right, Bot]

type MaxWidth :: Nat
type Size :: { MaxWidth :: Edges }
type Backgrounds :: {Path, [Size]}
type Dimensions :: {
  source_dir  :: Path
  backgrounds :: [Backgrounds]
}

type Image :: Buffer
type CSS :: String

-- | source image path , output image path, corresponding CSS rules
type Background :: {Image, CSS}

-- | source image path , output image path, corresponding CSS rules
type BackgroundData :: { Path, Path , Edges, MaxWidth }


normalizeDimensions :: Dimensions -> [BackgroundData]
generateBackground :: BackgroundData -> Background


