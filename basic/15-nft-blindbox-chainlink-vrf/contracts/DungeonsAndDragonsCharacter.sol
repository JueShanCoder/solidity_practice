pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';

contract DungeonsAndDragonsCharacter is ERC721PresetMinterPauserAutoId, VRFConsumerBaseV2{

}
