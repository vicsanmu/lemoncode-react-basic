import React from "react";
import { Link, generatePath } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface MemberEntity {
  id: string;
  login: string;
  avatar_url: string;
  organizations_url: string;
  organizations: MemberOrganization[];
}

interface MemberOrganization {
  login: string;
}

const LEMONCODE = "lemoncode";

export const ListPage: React.FC = () => {
  const [members, setMembers] = React.useState<MemberEntity[]>([]);
  const [membersFiltered, setMembersFiltered] = React.useState<MemberEntity[]>(
    []
  );
  const [filterValue, setFilterValue] = React.useState<string>(LEMONCODE);

  const fetchMembers = async () => {
    const membersResponse = await fetch(
      `https://api.github.com/orgs/lemoncode/members`
    );
    const membersJson: MemberEntity[] = await membersResponse.json();
    const membersInfo: MemberEntity[] = await Promise.all(
      membersJson.map(async (member) => {
        const memberOrganizationResponse = await fetch(
          member.organizations_url
        );
        const memberOrganizations: MemberOrganization[] =
          await memberOrganizationResponse.json();
        return {
          ...member,
          organizations: memberOrganizations,
        };
      })
    );
    setMembers(membersInfo);
    setMembersFiltered(
      membersInfo.filter((member) =>
        member.organizations.some(
          ({ login }) => login.toLowerCase() === filterValue
        )
      )
    );
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  const filterMembers = (value: string) => {
    setMembersFiltered(
      value
        ? members.filter((member) =>
            member.organizations.some(
              ({ login }) => login.toLowerCase() === value
            )
          )
        : members
    );
  };

  const columns: GridColDef[] = [
    {
      field: "avatar_url",
      headerName: "Avatar",
      renderCell: ({ value }) => <img src={value} style={{ width: "5rem" }} />,
    },
    { field: "id", headerName: "Id" },
    {
      field: "login",
      headerName: "Name",
      renderCell: ({ value }) => (
        <Link to={generatePath("/detail/:id", { id: value })}>{value}</Link>
      ),
    },
  ];

  return (
    <>
      <h2>Hello from List page</h2>
      <input
        defaultValue={LEMONCODE}
        onChange={(element) => setFilterValue(element.target.value)}
      ></input>
      <button onClick={() => filterMembers(filterValue)}>Filter</button>
      <div style={{ marginTop: "8px", height: 615, width: "100%" }}>
        <DataGrid
          rows={membersFiltered}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          rowHeight={100}
        />
      </div>
    </>
  );
};
