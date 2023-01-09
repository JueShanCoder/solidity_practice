pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Project.sol";

contract CrowdFunding {
    using SafeMath for uint256;

    // List of existing projects
    Project[] private projects;

    // event 
    event ProjectStarted(
        address contractAddress,
        address projectStarter,
        string projectTitle,
        string projectDesc,
        uint256 deadline,
        uint256 goalAmount
    );

    function startProject(
        string calldata title,
        string calldata description,
        uint durationInDays,
        uint amountToRaise
    ) external {
        uint raiseUntil = block.timestamp.add(durationInDays.mul(1 days));
        Project project = new Project(payable (msg.sender), title, description, raiseUntil, amountToRaise);
        projects.push(project);
        emit ProjectStarted(
            address(project),
            msg.sender,
            title,
            description,
            raiseUntil,
            amountToRaise
        );
    }

    function returnAllProjects() external view returns (Project[] memory) {
        return projects;
    }

}
